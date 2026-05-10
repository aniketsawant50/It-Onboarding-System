import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, taskApi, trainingApi } from '../../services/api';
import employeeLinks from './employeeLinks';
import { buildEmployeeData, getCurrentUserFromStorage } from './employeeHelpers';
import styles from '../Admin/Dashboard.module.css';

function EmployeeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [assets, setAssets] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  const currentUser = getCurrentUserFromStorage();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [{ data: assetData }, { data: trainingData }, { data: taskData }] = await Promise.all([
          assetApi.getAll(),
          trainingApi.getAll(),
          taskApi.getAll()
        ]);
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
    () => buildEmployeeData(currentUser, assets, trainings, tasks),
    [currentUser, assets, trainings, tasks]
  );

  const stats = useMemo(() => {
    if (!employeeData) return [];

    return [
      {
        label: 'Tasks Completed',
        value: `${employeeData.completedTaskCount}/${employeeData.taskCount}`,
        meta: `${employeeData.activeTasks} active tasks remaining`,
        tone: 'statPrimary'
      },
      {
        label: 'Training Completed',
        value: `${employeeData.completedTrainingCount}/${employeeData.trainingCount}`,
        meta: `Current: ${employeeData.latestTrainingTitle}`,
        tone: 'statSecondary'
      },
      {
        label: 'Equipment Status',
        value: String(employeeData.assetCount),
        meta: `${employeeData.assetStatus.replace('_', ' ')}`,
        tone: 'statWarning'
      },
      {
        label: 'Overall Completion',
        value: `${employeeData.completionRate}%`,
        meta: `Onboarding stage: ${employeeData.status}`,
        tone: 'statSuccess'
      }
    ];
  }, [employeeData]);

  if (!currentUser || !employeeData) {
    return <MainLayout links={employeeLinks} title="Employee Dashboard" />;
  }

  return (
    <MainLayout
      links={employeeLinks}
      title={`Welcome, ${currentUser.name}!`}
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
          <Card title="Your Onboarding Progress" subtitle="Track your journey and stay on schedule.">
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.pulseList}>
              <div className={styles.pulseItem}>
                <span>Tasks to complete</span>
                <strong>{employeeData.activeTasks}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Remaining training modules</span>
                <strong>{employeeData.trainingCount - employeeData.completedTrainingCount}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Equipment assigned</span>
                <strong>{employeeData.assetCount}</strong>
              </div>
            </div>
          </Card>
          <Card title="My Tasks & Assignments" subtitle="See what you need to complete and check your progress.">
            <ul className={styles.list}>
              <li>View all tasks assigned by your manager</li>
              <li>Mark tasks complete as you finish them</li>
              <li>Track priority and due dates</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/employee/my-tasks')}>
                View My Tasks
              </button>
              <button type="button" onClick={() => navigate('/employee', { state: { refresh: Date.now() } })}>
                Refresh Progress
              </button>
            </div>
          </Card>
          <Card title="Training & Learning" subtitle="Complete your assigned learning modules and training.">
            <ul className={styles.list}>
              <li>Access training materials and resources</li>
              <li>Mark training sessions as complete</li>
              <li>Track certification and compliance requirements</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/employee/my-training')}>
                View Training
              </button>
              <button type="button" onClick={() => navigate('/employee/my-profile')}>
                Update Profile
              </button>
            </div>
          </Card>
          <Card title="Your Equipment & Access" subtitle="Check the status of your IT equipment and system access.">
            <ul className={styles.list}>
              <li>View assigned laptops, phones, and accessories</li>
              <li>Check approval status of your equipment</li>
              <li>Review system access and credentials</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/employee/my-assets')}>
                View My Equipment
              </button>
              <button type="button" onClick={() => navigate('/employee/my-profile')}>
                My Profile
              </button>
            </div>
          </Card>
        </>
      }
    />
  );
}

export default EmployeeDashboard;
