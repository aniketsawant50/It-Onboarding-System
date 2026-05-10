import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, taskApi, trainingApi, userApi } from '../../services/api';
import managerLinks from './managerLinks';
import { buildTeamSnapshots, formatStatus, getStatusTone } from './managerHelpers';
import styles from '../Admin/Dashboard.module.css';

function ManagerTeamMembers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  const loadTeam = async () => {
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
      setError(loadError.response?.data?.message || 'Unable to load team members.');
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const teamRows = useMemo(
    () => buildTeamSnapshots(users, assets, trainings, tasks),
    [assets, tasks, trainings, users]
  );

  const columns = [
    { key: 'name', header: 'Employee Name' },
    { key: 'username', header: 'Username' },
    {
      key: 'status',
      header: 'Onboarding Stage',
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
      header: 'Completion %',
      render: (row) => `${row.completionRate}%`
    }
  ];

  return (
    <MainLayout links={managerLinks} title="Team Members">
      <div className={styles.adminGrid}>
        <Card title="Team Roster" subtitle="View all employees in your onboarding team with their progress status.">
          {error ? <p className={styles.error}>{error}</p> : null}
          <Table columns={columns} rows={teamRows} emptyMessage="No team members assigned yet." />
        </Card>
        <Card title="Team Summary" subtitle="Quick overview of team onboarding health.">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryTile}>
              <p>Total Team Members</p>
              <strong>{teamRows.length}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>In Manager Review</p>
              <strong>{teamRows.filter((member) => member.status === 'MANAGER_REVIEW').length}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Completed Onboarding</p>
              <strong>{teamRows.filter((member) => member.status === 'COMPLETED').length}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Avg Completion Rate</p>
              <strong>
                {teamRows.length
                  ? Math.round(teamRows.reduce((total, m) => total + m.completionRate, 0) / teamRows.length)
                  : 0}
                %
              </strong>
            </div>
          </div>
          <div className={styles.submitRow}>
            <button
              className={styles.tableButton}
              type="button"
              onClick={() => navigate('/manager', { state: { refresh: Date.now() } })}
            >
              Back to Manager Dashboard
            </button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export default ManagerTeamMembers;
