import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, taskApi, trainingApi, userApi } from '../../services/api';
import managerLinks from './managerLinks';
import { buildTeamSnapshots, formatStatus, getStatusTone } from './managerHelpers';
import styles from '../Admin/Dashboard.module.css';

const MANAGER_STAGE_OPTIONS = ['MANAGER_REVIEW', 'ONBOARDING_IN_PROGRESS', 'COMPLETED', 'PENDING'];

function ManagerTeamProgress() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [status, setStatus] = useState('MANAGER_REVIEW');
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
      setError(loadError.response?.data?.message || 'Unable to load team progress.');
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const teamRows = useMemo(
    () => buildTeamSnapshots(users, assets, trainings, tasks),
    [assets, tasks, trainings, users]
  );

  const handleUserChange = (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    const employee = teamRows.find((row) => String(row.id) === userId);
    if (employee) {
      setStatus(employee.status || 'MANAGER_REVIEW');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await userApi.updateStatus(Number(selectedUserId), { status });
      const employee = teamRows.find((row) => String(row.id) === selectedUserId);
      setMessage(`${employee?.name || 'Employee'} stage updated to ${formatStatus(status)}.`);
      await loadProgress();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to update employee stage.');
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
      key: 'taskCount',
      header: 'Tasks',
      render: (row) => `${row.completedTaskCount}/${row.taskCount} completed`
    },
    {
      key: 'trainingCount',
      header: 'Training',
      render: (row) => `${row.completedTrainingCount}/${row.trainingCount} complete`
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
      key: 'completionRate',
      header: 'Overall %',
      render: (row) => `${row.completionRate}%`
    }
  ];

  return (
    <MainLayout links={managerLinks} title="Team Progress Tracker">
      <div className={styles.adminGrid}>
        <Card title="Update Team Member Stage" subtitle="Move employees through manager-assigned stages of onboarding.">
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <label className={styles.selectField}>
              <span>Select Team Member</span>
              <select value={selectedUserId} onChange={handleUserChange} required>
                <option value="">Choose employee</option>
                {teamRows.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({formatStatus(employee.status)})
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectField}>
              <span>Manager Stage</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {MANAGER_STAGE_OPTIONS.map((option) => (
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
              <Button type="button" variant="secondary" onClick={() => navigate('/manager', { state: { refresh: Date.now() } })}>
                Back to Dashboard
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Team Progress Board" subtitle="See real-time completion metrics for each team member.">
          <Table columns={columns} rows={teamRows} emptyMessage="No team members to display." />
        </Card>
        <Card title="Progress Guide" subtitle="Understanding manager stages in the onboarding process.">
          <ul className={styles.list}>
            <li><strong>MANAGER_REVIEW</strong>: Employee is in manager's care and completing assigned tasks</li>
            <li><strong>ONBOARDING_IN_PROGRESS</strong>: Activities ongoing with manager oversight</li>
            <li><strong>COMPLETED</strong>: Employee has successfully finished all onboarding requirements</li>
            <li><strong>PENDING</strong>: Employee status awaiting department assignment</li>
          </ul>
          <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px', fontSize: '13px', color: '#2e7d32' }}>
            💡 <strong>Tip:</strong> Update stages as your team members progress through their tasks and training. This keeps
             everyone aligned on onboarding status.
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export default ManagerTeamProgress;
