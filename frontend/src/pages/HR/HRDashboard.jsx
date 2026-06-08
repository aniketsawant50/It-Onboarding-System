import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import MainLayout from '../../layouts/MainLayout';
import { hrOnboardingApi } from '../../services/api';
import styles from '../Admin/Dashboard.module.css';
import hrLinks from './hrLinks';

function HRDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await hrOnboardingApi.dashboard();
        setStats(data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load HR dashboard data.');
      }
    };
    load();
    const intervalId = window.setInterval(load, 15000);
    return () => window.clearInterval(intervalId);
  }, [location.state?.refresh]);

  const statCards = stats
    ? [
        {
          label: 'Pending HR approval',
          value: String(stats.pendingEmployeeApprovals ?? 0),
          meta: 'Employees awaiting start of HR review',
          tone: 'statWarning'
        },
        {
          label: 'Pending asset approvals',
          value: String(stats.pendingAssetApprovals ?? 0),
          meta: 'IT assets assigned by Admin awaiting HR sign-off',
          tone: 'statSecondary'
        },
        {
          label: 'Active employees',
          value: String(stats.activeEmployees ?? 0),
          meta: 'Fully activated portal accounts',
          tone: 'statSuccess'
        },
        {
          label: 'Inactive employees',
          value: String(stats.inactiveEmployees ?? 0),
          meta: 'Administratively deactivated',
          tone: 'statPrimary'
        },
        {
          label: 'With manager assigned',
          value: String(stats.employeesWithManagerAssigned ?? 0),
          meta: 'Employees who have a reporting manager on file',
          tone: 'statSecondary'
        },
        {
          label: 'Queries to Admin',
          value: String(stats.queryToAdminCount ?? 0),
          meta: 'Records waiting on Admin corrections',
          tone: 'statWarning'
        }
      ]
    : [];

  return (
    <MainLayout
      links={hrLinks}
      title="HR Operations Dashboard"
      stats={statCards.map((item) => (
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
          <Card title="HR Pulse" subtitle="Counts refresh automatically from the onboarding API.">
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.pulseList}>
              <div className={styles.pulseItem}>
                <span>Employees pending first HR action</span>
                <strong>{stats?.pendingEmployeeApprovals ?? '—'}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Open queries to Admin</span>
                <strong>{stats?.queryToAdminCount ?? '—'}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Assets awaiting HR decision</span>
                <strong>{stats?.pendingAssetApprovals ?? '—'}</strong>
              </div>
            </div>
          </Card>
          <Card title="Employee queue" subtitle="Search, filter, and run the full HR onboarding workflow.">
            <ul className={styles.list}>
              <li>Start HR review, verify details, assign reporting manager, then activate</li>
              <li>Reject or send a structured query back to Admin when data needs correction</li>
              <li>Open any row for timeline and audit history</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/hr/employee-queue')}>
                Open queue
              </button>
              <button type="button" onClick={() => navigate('/hr/queries')}>
                Queries to Admin
              </button>
            </div>
          </Card>
          <Card title="Asset approvals" subtitle="Approve or reject assets assigned to employees (optional).">
            <ul className={styles.list}>
              <li>Employee activation does not require assets</li>
              <li>Decisions appear immediately on the employee dashboard</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/hr/assets')}>
                Review assets
              </button>
            </div>
          </Card>
          <Card title="Manager assignment" subtitle="Assign the single reporting manager before activation.">
            <ul className={styles.list}>
              <li>Use the employee detail screen to pick an active Manager user</li>
              <li>Only HR can activate; activation requires a manager</li>
            </ul>
            <div className={styles.actions}>
              <button type="button" onClick={() => navigate('/hr/manager-handoff')}>
                Manager handoff
              </button>
            </div>
          </Card>
        </>
      }
    />
  );
}

export default HRDashboard;
