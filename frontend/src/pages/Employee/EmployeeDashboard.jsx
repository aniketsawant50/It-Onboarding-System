import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, taskApi, trainingApi, userApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import employeeLinks from './employeeLinks';
import { buildEmployeeData, formatStatus, getStatusTone } from './employeeHelpers';
import styles from '../Admin/Dashboard.module.css';

function EmployeeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [assets, setAssets] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [{ data: me }, { data: assetData }, { data: trainingData }, { data: taskData }] = await Promise.all([
          userApi.getCurrentUser(),
          assetApi.getAll(),
          trainingApi.getAll(),
          taskApi.getAll()
        ]);
        setProfile(me);
        setAssets(assetData);
        setTrainings(trainingData);
        setTasks(taskData);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load your dashboard data.');
      }
    };

    loadDashboard();
  }, [location.state?.refresh]);

  const employeeData = useMemo(
    () => (profile ? buildEmployeeData(profile, assets, trainings, tasks) : null),
    [profile, assets, trainings, tasks]
  );

  const stats = useMemo(() => {
    if (!employeeData) return [];

    return [
      {
        label: 'Tasks completed',
        value: `${employeeData.completedTaskCount}/${employeeData.taskCount}`,
        meta: `${employeeData.activeTasks} active tasks remaining`,
        tone: 'statPrimary'
      },
      {
        label: 'Training completed',
        value: `${employeeData.completedTrainingCount}/${employeeData.trainingCount}`,
        meta: `Current: ${employeeData.latestTrainingTitle}`,
        tone: 'statSecondary'
      },
      {
        label: 'Equipment',
        value: String(employeeData.assetCount),
        meta: employeeData.assetCount ? `${employeeData.assetStatus}` : 'No assets assigned',
        tone: 'statWarning'
      },
      {
        label: 'Employee ID',
        value: employeeData.employeeId || 'N/A',
        meta: employeeData.organizationEmail || 'Organization email pending',
        tone: 'statSuccess'
      }
    ];
  }, [employeeData]);

  if (!employeeData) {
    return (
      <MainLayout links={employeeLinks} title="Employee dashboard">
        {error ? <p className={styles.error}>{error}</p> : <p>Loading…</p>}
      </MainLayout>
    );
  }

  return (
    <MainLayout
      links={employeeLinks}
      title={`Welcome, ${profile.name}!`}
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
          <Card title="Your account" subtitle="Onboarding status and reporting line.">
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.pulseList}>
              <div className={styles.pulseItem}>
                <span>Employee ID</span>
                <strong>{employeeData.employeeId || 'N/A'}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Organization email</span>
                <strong>{employeeData.organizationEmail || '—'}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Lifecycle status</span>
                <strong>
                  <span className={`${styles.chip} ${styles[getStatusTone(employeeData.status)]}`}>
                    {formatStatus(employeeData.status)}
                  </span>
                </strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Reporting manager</span>
                <strong>{employeeData.reportingManagerName || 'Not assigned yet'}</strong>
              </div>
            </div>
          </Card>

          <Card title="Your assets" subtitle="Assigned equipment and current approval status.">
            {employeeData.assets && employeeData.assets.length > 0 ? (
              <ul className={styles.list}>
                {employeeData.assets.map((a) => (
                  <li key={a.id}>
                    <strong>{a.name}</strong> - {a.type} -{' '}
                    <span className={`${styles.chip} ${styles[getStatusTone(a.status)]}`}>
                      {formatStatus(a.status)}
                    </span>
                    <div className={styles.meta}>
                      Assigned: {formatDateTime(a.assignedDate) || 'Not available'}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.meta}>No assets assigned.</p>
            )}
          </Card>

          <Card title="My tasks & assignments" subtitle="See what you need to complete and check your progress.">
            <ul className={styles.list}>
              <li>View all tasks assigned by your manager</li>
              <li>Mark tasks complete as you finish them</li>
              <li>Track priority and due dates</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/employee/my-tasks')}>
                View my tasks
              </button>
              <button type="button" onClick={() => navigate('/employee', { state: { refresh: Date.now() } })}>
                Refresh progress
              </button>
            </div>
          </Card>

          <Card title="Training & learning" subtitle="Complete your assigned learning modules and training.">
            <ul className={styles.list}>
              <li>Access training materials and resources</li>
              <li>Mark training sessions as complete</li>
              <li>Track certification and compliance requirements</li>
            </ul>

            <div className={styles.actions}>
              {/*  Training button hidden as requested */}
              {/* <button type="button" onClick={() => navigate('/employee/my-training')}>
                View training
              </button> */}

              <button type="button" onClick={() => navigate('/employee/my-profile')}>
                Update profile
              </button>
            </div>
          </Card>
        </>
      }
    />
  );
}

export default EmployeeDashboard;