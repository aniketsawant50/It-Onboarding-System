import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, taskApi, userApi, adminOnboardingApi } from '../../services/api';
import adminLinks from './adminLinks';
import styles from './Dashboard.module.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  const [hrQueryCount, setHrQueryCount] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [{ data: userData }, { data: assetData }, { data: taskData }, { data: queries }] = await Promise.all([
          userApi.getAll(),
          assetApi.getAll(),
          taskApi.getAll(),
          adminOnboardingApi.listHrQueries()
        ]);
        setUsers(userData);
        setAssets(assetData);
        setTasks(taskData);
        setHrQueryCount(Array.isArray(queries) ? queries.length : 0);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load admin dashboard data.');
      }
    };

    loadDashboard();
  }, [location.state?.refresh]);

  const stats = useMemo(() => {
    const nonAdminUsers = users.filter((user) => user.role !== 'ADMIN');
    const activeEmployees = nonAdminUsers.filter((user) => user.status === 'ACTIVE').length;
    const inactiveEmployees = nonAdminUsers.filter((user) => user.status === 'INACTIVE').length;
    const completedTasks = tasks.filter((task) => task.status?.toUpperCase() === 'COMPLETED').length;
    const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return [
      {
        label: 'Active Employees',
        value: String(activeEmployees),
        meta: `${nonAdminUsers.length} total managed accounts`,
        tone: 'statPrimary'
      },
      {
        label: 'Assets Assigned',
        value: String(assets.length),
        meta: `${Math.max(nonAdminUsers.length - assets.length, 0)} pending allocations`,
        tone: 'statSecondary'
      },
      {
        label: 'Inactive Accounts',
        value: String(inactiveEmployees),
        meta: inactiveEmployees ? 'Inactive accounts blocked from access' : 'All accounts can access',
        tone: 'statWarning'
      },
      {
        label: 'Completion Rate',
        value: `${completionRate}%`,
        meta: `${completedTasks}/${tasks.length} tasks completed`,
        tone: 'statSuccess'
      }
    ];
  }, [assets.length, tasks, users]);

  return (
    <MainLayout
      links={adminLinks}
      title="Super Admin Dashboard"
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
          <Card title="Admin Pulse" subtitle="Live operational summary from the onboarding database.">
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.pulseList}>
              <div className={styles.pulseItem}>
                <span>HR queries awaiting admin fix</span>
                <strong>{hrQueryCount}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Assets already assigned</span>
                <strong>{stats[1].value}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Task completion trend</span>
                <strong>{stats[3].value}</strong>
              </div>
            </div>
          </Card>
          <Card title="User Management" subtitle="Create users and assign secure roles.">
            <ul className={styles.list}>
              <li>Create HR, Manager, and Employee accounts</li>
              <li>Maintain status visibility across onboarding stages</li>
              <li>Centralize access control with role governance</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/admin/create-employee')}>Create User</button>
              <button type="button" onClick={() => navigate('/admin/roles')}>Assign Role</button>
              <button type="button" onClick={() => navigate('/admin/employees')}>View Employee List</button>
            </div>
          </Card>
          <Card title="Asset Oversight" subtitle="Track assignment and device readiness.">
            <ul className={styles.list}>
              <li>Assign laptops, email IDs, and software bundles</li>
              <li>Monitor employee onboarding activity and asset utilization</li>
              <li>Review pending provisioning requests</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/admin/assign-assets')}>Assign Asset</button>
              <button type="button" onClick={() => navigate('/admin/employees')}>Check Availability</button>
              <button type="button" onClick={() => navigate('/admin/employees')}>View Reports</button>
            </div>
          </Card>
          <Card title="HR onboarding queries" subtitle="When HR sends a record back for corrections, resolve it here.">
            <ul className={styles.list}>
              <li>Update employee master data after an HR query</li>
              <li>Resubmit to HR so verification can continue</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/admin/hr-queries')}>
                Open HR queries ({hrQueryCount})
              </button>
            </div>
          </Card>
          <Card title="System Access" subtitle="Monitor platform-wide onboarding activity.">
            <ul className={styles.list}>
              <li>Review all active onboarding records</li>
              <li>Track role-based access coverage</li>
              <li>Support HR and managers with escalations</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/admin/roles')}>Open Audit View</button>
              <button type="button" onClick={() => navigate('/admin/employees')}>Check Status</button>
            </div>
          </Card>
        </>
      }
    />
  );
}

export default AdminDashboard;
