import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, taskApi, trainingApi, userApi } from '../../services/api';
import hrLinks from './hrLinks';
import { buildEmployeeSnapshots, formatStatus, getStatusTone } from './hrHelpers';
import styles from '../Admin/Dashboard.module.css';

function HREmployeeQueue() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadQueue = async () => {
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
      setError(loadError.response?.data?.message || 'Unable to load the HR employee queue.');
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const employeeRows = useMemo(
    () => buildEmployeeSnapshots(users, assets, trainings, tasks),
    [assets, tasks, trainings, users]
  );

  const handleStatusUpdate = async (employeeId, status, successMessage) => {
    setError('');
    setMessage('');
    try {
      await userApi.updateStatus(employeeId, { status });
      setMessage(successMessage);
      await loadQueue();
    } catch (actionError) {
      setError(actionError.response?.data?.message || 'Unable to update the employee stage.');
    }
  };

  const columns = [
    { key: 'name', header: 'Employee' },
    { key: 'username', header: 'Username' },
    {
      key: 'status',
      header: 'HR Stage',
      render: (row) => (
        <span className={`${styles.chip} ${styles[getStatusTone(row.status)]}`}>
          {formatStatus(row.status)}
        </span>
      )
    },
    {
      key: 'assetCount',
      header: 'Assets',
      render: (row) => `${row.assetCount} assigned`
    },
    {
      key: 'trainingCount',
      header: 'Training',
      render: (row) => `${row.trainingCount} records`
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className={styles.tableActions}>
          <button
            className={styles.tableButton}
            type="button"
            onClick={() =>
              handleStatusUpdate(row.id, 'HR_APPROVED', `${row.name} approved for HR onboarding.`)
            }
          >
            Approve
          </button>
          <button
            className={`${styles.tableButton} ${styles.tableButtonSecondary}`}
            type="button"
            onClick={() =>
              handleStatusUpdate(
                row.id,
                'ONBOARDING_IN_PROGRESS',
                `Onboarding started for ${row.name}.`
              )
            }
          >
            Start
          </button>
        </div>
      )
    }
  ];

  return (
    <MainLayout links={hrLinks} title="HR Employee Queue">
      <div className={styles.adminGrid}>
        <Card title="Employee Intake Queue" subtitle="Every employee account created by Admin is surfaced here for HR action.">
          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          <Table columns={columns} rows={employeeRows} emptyMessage="No employee accounts are waiting in the HR queue." />
        </Card>
        <Card title="Queue Summary" subtitle="Quick view of who is ready for the next onboarding step.">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryTile}>
              <p>Pending Review</p>
              <strong>{employeeRows.filter((employee) => employee.status === 'PENDING').length}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>HR Approved</p>
              <strong>{employeeRows.filter((employee) => employee.status === 'HR_APPROVED').length}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>In Progress</p>
              <strong>
                {employeeRows.filter((employee) => employee.status === 'ONBOARDING_IN_PROGRESS').length}
              </strong>
            </div>
          </div>
          <div className={styles.submitRow}>
            <button
              className={styles.tableButton}
              type="button"
              onClick={() => navigate('/hr', { state: { refresh: Date.now() } })}
            >
              Back to HR Dashboard
            </button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export default HREmployeeQueue;
