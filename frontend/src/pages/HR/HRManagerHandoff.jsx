import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { hrOnboardingApi, userApi } from '../../services/api';
import hrLinks from './hrLinks';
import { formatStatus, getStatusTone } from './hrHelpers';
import styles from '../Admin/Dashboard.module.css';

function canHandoff(row) {
  return !['QUERY_TO_ADMIN', 'REJECTED', 'INACTIVE'].includes(row.status);
}

function HRManagerHandoff() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [managers, setManagers] = useState([]);
  const [managerSelections, setManagerSelections] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setError('');
    try {
      const [{ data: employees }, { data: users }] = await Promise.all([
        hrOnboardingApi.listEmployees(),
        userApi.getAll()
      ]);
      const activeManagers = users.filter((user) => user.role === 'MANAGER' && user.status === 'ACTIVE');
      setManagers(activeManagers);
      setRows(
        employees.filter((employee) => !['QUERY_TO_ADMIN', 'REJECTED', 'INACTIVE'].includes(employee.status))
      );
      setManagerSelections((current) => {
        const next = { ...current };
        employees.forEach((employee) => {
          if (employee.reportingManagerId && !next[employee.id]) {
            next[employee.id] = String(employee.reportingManagerId);
          }
        });
        return next;
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load manager handoff data.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runAction = async (action, success) => {
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(success);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
    }
  };

  const columns = useMemo(
    () => [
      { key: 'employeeId', header: 'Employee ID' },
      { key: 'name', header: 'Employee' },
      {
        key: 'reportingManagerName',
        header: 'Reporting manager',
        render: (row) => row.reportingManagerName || 'Not assigned'
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <span className={`${styles.chip} ${styles[getStatusTone(row.status)]}`}>{formatStatus(row.status)}</span>
        )
      },
      {
        key: 'managerSelect',
        header: 'Assign manager',
        render: (row) =>
          canHandoff(row) && row.status !== 'ACTIVE' ? (
            <select
              value={managerSelections[row.id] || ''}
              onChange={(event) =>
                setManagerSelections((current) => ({
                  ...current,
                  [row.id]: event.target.value
                }))
              }
            >
              <option value="">Select manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.username})
                </option>
              ))}
            </select>
          ) : (
            <span className={`${styles.chip} ${styles.chipMuted}`}>No change</span>
          )
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => {
          const selectedManagerId = managerSelections[row.id];
          return (
            <div className={styles.tableActions}>
              {row.status === 'PENDING_HR_APPROVAL' ? (
                <button
                  className={styles.tableButton}
                  type="button"
                  onClick={() =>
                    runAction(() => hrOnboardingApi.startReview(row.id), `${row.name} moved to HR review.`)
                  }
                >
                  Start review
                </button>
              ) : null}
              {canHandoff(row) && row.status !== 'ACTIVE' ? (
                <button
                  className={styles.tableButton}
                  type="button"
                  disabled={!selectedManagerId}
                  onClick={() =>
                    runAction(
                      () => hrOnboardingApi.assignManager(row.id, { managerUserId: Number(selectedManagerId) }),
                      `Manager assigned to ${row.name}.`
                    )
                  }
                >
                  Save manager
                </button>
              ) : null}
              <button className={styles.tableButtonSecondary} type="button" onClick={() => navigate(`/hr/employees/${row.id}`)}>
                Details
              </button>
            </div>
          );
        }
      }
    ],
    [managerSelections, managers, navigate]
  );

  return (
    <MainLayout links={hrLinks} title="Manager handoff">
      <div className={styles.adminGrid}>
        <Card title="Assign reporting manager" subtitle="HR assigns the single Manager role. Updates appear immediately on the employee dashboard.">
          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          <Table columns={columns} rows={rows} emptyMessage="No employees are ready for manager handoff." />
        </Card>
        <Card title="Available managers" subtitle="Only active Manager accounts can be selected.">
          <ul className={styles.list}>
            {managers.length === 0 ? <li>No active manager users found.</li> : null}
            {managers.map((manager) => (
              <li key={manager.id}>
                <strong>{manager.name}</strong> - {manager.username}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}

export default HRManagerHandoff;
