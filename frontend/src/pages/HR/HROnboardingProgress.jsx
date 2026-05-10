import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, taskApi, trainingApi, userApi } from '../../services/api';
import hrLinks from './hrLinks';
import {
  buildEmployeeSnapshots,
  formatStatus,
  getStatusTone,
  HR_STAGE_OPTIONS
} from './hrHelpers';
import styles from '../Admin/Dashboard.module.css';

function HROnboardingProgress() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadProgress = async () => {
    try {
      const [{ data: userData }, { data: assetData }, { data: trainingData }, { data: taskData }] =
        await Promise.all([
          userApi.getAll(),
          assetApi.getAll(),
          trainingApi.getAll(),
          taskApi.getAll()
        ]);
      setUsers(userData);
      setAssets(assetData);
      setTrainings(trainingData);
      setTasks(taskData);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load onboarding progress.');
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const employeeRows = useMemo(
    () => buildEmployeeSnapshots(users, assets, trainings, tasks),
    [assets, tasks, trainings, users]
  );

  const handleUserChange = (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    const employee = employeeRows.find((row) => String(row.id) === userId);
    if (employee) {
      setStatus(employee.status || 'PENDING');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await userApi.updateStatus(Number(selectedUserId), { status });
      setMessage('Employee onboarding stage updated successfully.');
      await loadProgress();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to update onboarding progress.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Employee' },
    {
      key: 'status',
      header: 'Current Stage',
      render: (row) => (
        <span className={`${styles.chip} ${styles[getStatusTone(row.status)]}`}>
          {formatStatus(row.status)}
        </span>
      )
    },
    {
      key: 'assetStatus',
      header: 'Asset Status',
      render: (row) => (
        <span className={`${styles.chip} ${styles[getStatusTone(row.assetStatus)]}`}>
          {formatStatus(row.assetStatus)}
        </span>
      )
    },
    {
      key: 'training',
      header: 'Training',
      render: (row) => `${row.completedTrainingCount}/${row.trainingCount} complete`
    },
    {
      key: 'tasks',
      header: 'Tasks',
      render: (row) => `${row.completedTaskCount}/${row.taskCount} complete`
    },
    {
      key: 'completionRate',
      header: 'Completion',
      render: (row) => `${row.completionRate}%`
    }
  ];

  return (
    <MainLayout links={hrLinks} title="Onboarding Progress Tracker">
      <div className={styles.adminGrid}>
        <Card title="Update Employee Stage" subtitle="Move employees through the HR onboarding process with database-backed status.">
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <label className={styles.selectField}>
              <span>Select Employee</span>
              <select value={selectedUserId} onChange={handleUserChange} required>
                <option value="">Choose employee</option>
                {employeeRows.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({formatStatus(employee.status)})
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectField}>
              <span>Onboarding Stage</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {HR_STAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {formatStatus(option)}
                  </option>
                ))}
              </select>
            </label>
            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.success}>{message}</p> : null}
            <div className={styles.submitRow}>
              <Button type="submit">{loading ? 'Updating...' : 'Update Progress'}</Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/hr', { state: { refresh: Date.now() } })}>
                Back to Dashboard
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Live Progress Board" subtitle="Combined view of asset readiness, training, and tasks for each employee.">
          <Table columns={columns} rows={employeeRows} emptyMessage="No employee onboarding progress is available yet." />
        </Card>
      </div>
    </MainLayout>
  );
}

export default HROnboardingProgress;
