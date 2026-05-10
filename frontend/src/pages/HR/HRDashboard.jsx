import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, taskApi, trainingApi, userApi } from '../../services/api';
import styles from '../Admin/Dashboard.module.css';
import hrLinks from './hrLinks';
import { buildEmployeeSnapshots } from './hrHelpers';

function HRDashboard() {
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
        setError(loadError.response?.data?.message || 'Unable to load HR dashboard data.');
      }
    };

    loadDashboard();
  }, [location.state?.refresh]);

  const employeeSnapshots = useMemo(
    () => buildEmployeeSnapshots(users, assets, trainings, tasks),
    [assets, tasks, trainings, users]
  );

  const stats = useMemo(() => {
    const assetsPendingApproval = assets.filter((asset) => asset.status === 'PENDING').length;
    const managerReady = employeeSnapshots.filter((employee) => employee.status === 'MANAGER_REVIEW')
      .length;
    const completed = employeeSnapshots.filter((employee) => employee.status === 'COMPLETED').length;
    const avgTaskCompletion = employeeSnapshots.length
      ? Math.round(
          employeeSnapshots.reduce((total, employee) => total + employee.completionRate, 0) /
            employeeSnapshots.length
        )
      : 0;

    return [
      {
        label: 'Employees In Pipeline',
        value: String(employeeSnapshots.length),
        meta: 'Admin-created employee accounts visible to HR',
        tone: 'statPrimary'
      },
      {
        label: 'Assets Awaiting Approval',
        value: String(assetsPendingApproval),
        meta: 'Assigned by Admin and waiting for HR sign-off',
        tone: 'statWarning'
      },
      {
        label: 'Forwarded To Manager',
        value: String(managerReady),
        meta: 'Ready for manager-led training follow-through',
        tone: 'statSecondary'
      },
      {
        label: 'Average Task Completion',
        value: `${avgTaskCompletion}%`,
        meta: `${completed} employees fully completed onboarding`,
        tone: 'statSuccess'
      }
    ];
  }, [assets, employeeSnapshots]);

  return (
    <MainLayout
      links={hrLinks}
      title="HR Operations Dashboard"
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
          <Card title="HR Pulse" subtitle="Live onboarding signals from employees, assets, tasks, and training.">
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.pulseList}>
              <div className={styles.pulseItem}>
                <span>Employees still waiting for HR action</span>
                <strong>{employeeSnapshots.filter((employee) => employee.status === 'PENDING').length}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Assets approved and ready for next step</span>
              <strong>{employeeSnapshots.filter((employee) => employee.assetStatus === 'APPROVED').length}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Training handoffs created</span>
                <strong>{trainings.length}</strong>
              </div>
            </div>
          </Card>
          <Card title="Employee Queue" subtitle="Validate new employees and start their onboarding lifecycle.">
            <ul className={styles.list}>
              <li>See all employee accounts created by Admin</li>
              <li>Approve employee records for the HR stage</li>
              <li>Kick off onboarding for the right hires</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/hr/employee-queue')}>
                Open Queue
              </button>
              <button type="button" onClick={() => navigate('/hr/progress')}>
                Update Stages
              </button>
            </div>
          </Card>
          <Card title="Asset Approvals" subtitle="Approve or return the laptops and access packages assigned by Admin.">
            <ul className={styles.list}>
              <li>Review each assigned asset before employee activation</li>
              <li>Approve or reject asset packs with database-backed status</li>
              <li>Keep the onboarding status aligned with IT readiness</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/hr/assets')}>
                Review Assets
              </button>
              <button type="button" onClick={() => navigate('/hr/progress')}>
                Track Readiness
              </button>
            </div>
          </Card>
          <Card title="Manager Handoff" subtitle="Forward employees to manager-led training and follow-up tasks.">
            <ul className={styles.list}>
              <li>Create training records in the database</li>
              <li>Generate onboarding tasks for employees</li>
              <li>Move the employee status into manager review</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/hr/manager-handoff')}>
                Forward To Manager
              </button>
              <button type="button" onClick={() => navigate('/hr/progress')}>
                Monitor Completion
              </button>
            </div>
          </Card>
        </>
      }
    />
  );
}

export default HRDashboard;
