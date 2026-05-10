import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Input from '../../components/UI/Input/Input';
import MainLayout from '../../layouts/MainLayout';
import { taskApi, trainingApi, userApi } from '../../services/api';
import hrLinks from './hrLinks';
import { formatStatus } from './hrHelpers';
import styles from '../Admin/Dashboard.module.css';

function HRManagerHandoff() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [form, setForm] = useState({
    employeeId: '',
    title: 'Manager Orientation Track',
    description: 'Complete the assigned training and connect with your manager for the next onboarding milestone.'
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [{ data: userData }, { data: trainingData }] = await Promise.all([
        userApi.getAll(),
        trainingApi.getAll()
      ]);
      setUsers(userData.filter((user) => user.role === 'EMPLOYEE'));
      setTrainings(trainingData);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load manager handoff data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handoffRows = useMemo(
    () =>
      trainings
        .slice()
        .reverse()
        .slice(0, 6)
        .map((training) => ({
          ...training,
          employeeName: users.find((user) => user.id === training.employeeId)?.name || 'Employee'
        })),
    [trainings, users]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const employeeId = Number(form.employeeId);
      await trainingApi.create({
        title: form.title,
        employeeId,
        completionStatus: false
      });
      await taskApi.create({
        title: `Complete training: ${form.title}`,
        description: form.description,
        assignedTo: employeeId,
        status: 'PENDING'
      });
      await userApi.updateStatus(employeeId, { status: 'MANAGER_REVIEW' });
      const employee = users.find((user) => user.id === employeeId);
      setMessage(`${employee?.name || 'Employee'} forwarded to manager training successfully.`);
      setForm((current) => ({ ...current, employeeId: '' }));
      await loadData();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to forward the employee to manager training.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout links={hrLinks} title="Manager Training Handoff">
      <div className={styles.adminGrid}>
        <Card title="Forward To Manager" subtitle="Create the training record and onboarding task in one HR action.">
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <label className={styles.selectField}>
              <span>Select Employee</span>
              <select name="employeeId" value={form.employeeId} onChange={handleChange} required>
                <option value="">Choose employee</option>
                {users
                  .filter((user) => user.status !== 'COMPLETED')
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({formatStatus(user.status)})
                    </option>
                  ))}
              </select>
            </label>
            <Input label="Training Title" name="title" value={form.title} onChange={handleChange} required />
            <label className={styles.selectField}>
              <span>Manager Note / Task Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
              />
            </label>
            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.success}>{message}</p> : null}
            <div className={styles.submitRow}>
              <Button type="submit">{loading ? 'Forwarding...' : 'Forward To Manager'}</Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/hr', { state: { refresh: Date.now() } })}>
                Back to Dashboard
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Recent Handoffs" subtitle="Latest training records created by HR for manager follow-through.">
          <ul className={styles.list}>
            {handoffRows.map((row) => (
              <li key={row.id}>
                {row.employeeName} - {row.title}
              </li>
            ))}
            {!handoffRows.length ? <li>No employees have been forwarded yet.</li> : null}
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}

export default HRManagerHandoff;
