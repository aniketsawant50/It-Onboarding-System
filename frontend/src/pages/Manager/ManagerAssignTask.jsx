import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Input from '../../components/UI/Input/Input';
import MainLayout from '../../layouts/MainLayout';
import { taskApi, userApi } from '../../services/api';
import managerLinks from './managerLinks';
import styles from '../Admin/Dashboard.module.css';

function ManagerAssignTask() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'PENDING',
    completionDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await userApi.getAll();
        setUsers(data.filter((user) => user.role === 'EMPLOYEE'));
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load employees.');
      }
    };

    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    if (form.status === 'COMPLETED' && !form.completionDate) {
      setLoading(false);
      setError('Completion date is required when status is COMPLETED.');
      return;
    }
    try {
      const payload = {
        ...form,
        assignedTo: Number(form.assignedTo),
        completionDate: form.completionDate || null
      };
      const { data } = await taskApi.create(payload);
      const employee = users.find((user) => user.id === data.assignedTo?.id);
      setMessage(`Task "${data.title}" assigned to ${employee?.name || 'employee'} successfully.`);
      setForm({
        title: '',
        description: '',
        assignedTo: '',
        status: 'PENDING',
        completionDate: ''
      });
      window.setTimeout(() => {
        navigate('/manager/task-board', { state: { refresh: Date.now() } });
      }, 1200);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to assign task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout links={managerLinks} title="Assign Task">
      <div className={styles.adminGrid}>
        <Card title="Create Team Task" subtitle="Assign onboarding tasks to team members for their first week.">
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <Input
              label="Task Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Complete role orientation"
              required
            />
            <label className={styles.selectField}>
              <span>Assign To</span>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} required>
                <option value="">Select employee</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.employeeId || user.username})
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectField}>
              <span>Task Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Detailed task instructions and expectations"
              />
            </label>
            <label className={styles.selectField}>
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </label>
            <Input
              label="Completion Date"
              name="completionDate"
              type="date"
              value={form.completionDate}
              onChange={handleChange}
              required={form.status === 'COMPLETED'}
            />
            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.success}>{message}</p> : null}
            <div className={styles.submitRow}>
              <Button type="submit">{loading ? 'Assigning...' : 'Assign Task'}</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/manager/task-board', { state: { refresh: Date.now() } })}
              >
                View Task Board
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Task Assignment Tips" subtitle="Best practices for effective onboarding tasks.">
          <ul className={styles.list}>
            <li>Create clear, actionable tasks with specific deliverables</li>
            <li>Break down larger onboarding goals into smaller manageable tasks</li>
            <li>Assign tasks based on the employee's role and experience level</li>
            <li>Provide context about why each task matters for their role</li>
            <li>Track completion to identify blockers early</li>
            <li>Celebrate task completion milestones to build momentum</li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}

export default ManagerAssignTask;
