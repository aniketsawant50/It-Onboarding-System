import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, taskApi, trainingApi, userApi } from '../../services/api';
import managerLinks from './managerLinks';
import { buildTeamSnapshots } from './managerHelpers';
import styles from '../Admin/Dashboard.module.css';

function ManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
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
        setError(loadError.response?.data?.message || 'Unable to load manager dashboard data.');
      }
    };

    loadDashboard();
    const intervalId = window.setInterval(loadDashboard, 15000);
    return () => window.clearInterval(intervalId);
  }, [location.state?.refresh]);

  const teamSnapshots = useMemo(
    () => buildTeamSnapshots(users, assets, trainings, tasks),
    [assets, tasks, trainings, users]
  );

  const stats = useMemo(() => {
    const teamMembers = teamSnapshots.length;
    const activeTasks = teamSnapshots.reduce((total, member) => total + member.activeTasks, 0);
    const pendingApprovals = teamSnapshots.filter(
      (member) => member.status && !['ACTIVE', 'INACTIVE', 'REJECTED'].includes(member.status)
    ).length;
    const avgCompletion = teamMembers
      ? Math.round(teamSnapshots.reduce((total, member) => total + member.completionRate, 0) / teamMembers)
      : 0;

    return [
      {
        label: 'Team Members',
        value: String(teamMembers),
        meta: `${teamMembers} employees in onboarding`,
        tone: 'statPrimary'
      },
      {
        label: 'Active Tasks',
        value: String(activeTasks),
        meta: `${activeTasks} pending team tasks`,
        tone: 'statWarning'
      },
      {
        label: 'Pending Approvals',
        value: String(pendingApprovals),
        meta: 'Awaiting manager review or HR action',
        tone: 'statSecondary'
      },
      {
        label: 'Team Completion Rate',
        value: `${avgCompletion}%`,
        meta: `Average onboarding progress`,
        tone: 'statSuccess'
      }
    ];
  }, [teamSnapshots]);

  return (
    <MainLayout
      links={managerLinks}
      title="Manager Dashboard"
      stats={stats.map((item) => (
        <Card key={item.label}>
          <div className={`${styles.statCard} ${styles[item.tone]}`}>
            <p className={styles.label}>{item.label}</p>
            <strong className={styles.value}>{item.value}</strong>
            <p className={styles.meta}>{item.meta}</p>
          </div>
        </Card>
      ))}
      panels={
        <>
          <Card title="Manager Pulse" subtitle="Live team onboarding status and activity.">
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.pulseList}>
              <div className={styles.pulseItem}>
                <span>Team members needing attention</span>
                <strong>{stats[2].value}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Active tasks to track</span>
                <strong>{stats[1].value}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Team onboarding completion</span>
                <strong>{stats[3].value}</strong>
              </div>
            </div>
          </Card>
          <Card title="Task Planning" subtitle="Assign and track work for a strong first week.">
            <ul className={styles.list}>
              <li>Distribute tasks based on employee role and onboarding stage</li>
              <li>Keep daily progress visible to the team and stakeholders</li>
              <li>Spot blockers early with shared accountability</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/manager/assign-task')}>
                Assign Task
              </button>
              <button type="button" onClick={() => navigate('/manager/task-board')}>
                Review Task Board
              </button>
              <button type="button" onClick={() => navigate('/manager/team-progress')}>
                Track Completion
              </button>
            </div>
          </Card>
          <Card title="Team Progress" subtitle="Monitor each new joiner moving through onboarding.">
            <ul className={styles.list}>
              <li>See real-time onboarding stage for each team member</li>
              <li>Review training completion and task progress</li>
              <li>Coordinate with HR on approvals still pending</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/manager/team-members')}>
                View Team Roster
              </button>
              <button type="button" onClick={() => navigate('/manager/team-progress')}>
                View Progress Details
              </button>
              <button type="button" onClick={() => navigate('/manager', { state: { refresh: Date.now() } })}>
                Refresh Dashboard
              </button>
            </div>
          </Card>
          <Card title="Asset Coordination" subtitle="Ensure team members have the equipment they need.">
            <ul className={styles.list}>
              <li>Track asset assignments for your team</li>
              <li>Identify missing or pending hardware and access</li>
              <li>Support cross-functional completion tracking</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/manager/team-members')}>
                Check Asset Status
              </button>
              <button type="button" onClick={() => navigate('/manager', { state: { refresh: Date.now() } })}>
                Request Support
              </button>
            </div>
          </Card>
        </>
      }
    />
  );
}

export default ManagerDashboard;
