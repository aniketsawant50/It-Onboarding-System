import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import MainLayout from '../../layouts/MainLayout';
import { hrOnboardingApi, userApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import hrLinks from './hrLinks';
import { formatStatus, getStatusTone } from './hrHelpers';
import styles from '../Admin/Dashboard.module.css';

const QUERY_REASONS = [
  'INCORRECT_PERSONAL_DETAILS',
  'INCORRECT_ORGANIZATION_EMAIL',
  'ASSET_OR_EQUIPMENT_MISMATCH',
  'ROLE_OR_DEPARTMENT_MISMATCH',
  'OTHER'
];

function HREmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employeeId = Number(id);

  const [employee, setEmployee] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [audit, setAudit] = useState([]);
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [rejectRemarks, setRejectRemarks] = useState('');
  const [queryReason, setQueryReason] = useState('OTHER');
  const [queryRemarks, setQueryRemarks] = useState('');
  const [managerId, setManagerId] = useState('');

  const loadAll = async () => {
    setError('');
    try {
      const [{ data: emp }, { data: tl }, { data: ad }, { data: users }] = await Promise.all([
        hrOnboardingApi.getEmployee(employeeId),
        hrOnboardingApi.timeline(employeeId),
        hrOnboardingApi.audit(employeeId),
        userApi.getAll()
      ]);
      setEmployee(emp);
      setTimeline(tl);
      setAudit(ad);
      setManagers(users.filter((u) => u.role === 'MANAGER' && u.status === 'ACTIVE'));
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load employee.');
    }
  };

  useEffect(() => {
    if (!Number.isFinite(employeeId)) return;
    loadAll();
  }, [employeeId]);

  const status = employee?.status || '';

  const run = async (fn, success) => {
    setError('');
    setMessage('');
    try {
      await fn();
      setMessage(success);
      await loadAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
    }
  };

  const header = useMemo(() => {
    if (!employee) return 'Employee';
    return `${employee.name} (${employee.employeeId || '—'})`;
  }, [employee]);

  if (!Number.isFinite(employeeId)) {
    return (
      <MainLayout links={hrLinks} title="Employee">
        <p>Invalid employee id.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout links={hrLinks} title={header}>
      <div className={styles.adminGrid}>
        <Card title="Profile" subtitle="Current onboarding record.">
          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          {employee ? (
            <div className={styles.pulseList}>
              <div className={styles.pulseItem}>
                <span>Lifecycle</span>
                <strong>
                  <span className={`${styles.chip} ${styles[getStatusTone(status)]}`}>{formatStatus(status)}</span>
                </strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Username</span>
                <strong>{employee.username}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Personal email</span>
                <strong>{employee.email}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Organization email</span>
                <strong>{employee.organizationEmail}</strong>
              </div>
              <div className={styles.pulseItem}>
                <span>Reporting manager</span>
                <strong>{employee.reportingManagerName || '—'}</strong>
              </div>
              {employee.lastQueryAt ? (
                <div className={styles.pulseItem}>
                  <span>Last query</span>
                  <strong>
                    {formatDateTime(employee.lastQueryAt)} — {employee.lastQueryReason}
                  </strong>
                </div>
              ) : null}
            </div>
          ) : (
            <p>Loading…</p>
          )}
        </Card>

        <Card title="HR actions" subtitle="Buttons shown depend on the current lifecycle status.">
          <div className={styles.formGrid}>
            {status === 'PENDING_HR_APPROVAL' ? (
              <div className={styles.submitRow}>
                <button
                  type="button"
                  className={styles.tableButton}
                  onClick={() => run(() => hrOnboardingApi.startReview(employeeId), 'Moved to HR review.')}
                >
                  Start HR review
                </button>
              </div>
            ) : null}

            {status === 'HR_REVIEW' ? (
              <div className={styles.formGrid}>
                <button
                  type="button"
                  className={styles.tableButton}
                  onClick={() => run(() => hrOnboardingApi.verifyEmployee(employeeId), 'Verification recorded.')}
                >
                  Record verification
                </button>
                <label className={styles.selectField}>
                  <span>Assign reporting manager</span>
                  <select value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                    <option value="">Select manager…</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.username})
                      </option>
                    ))}
                  </select>
                </label>
                <div className={styles.submitRow}>
                  <button
                    type="button"
                    className={styles.tableButton}
                    disabled={!managerId}
                    onClick={() =>
                      run(
                        () => hrOnboardingApi.assignManager(employeeId, { managerUserId: Number(managerId) }),
                        'Manager assigned.'
                      )
                    }
                  >
                    Save manager
                  </button>
                  <button
                    type="button"
                    className={styles.tableButton}
                    onClick={() =>
                      run(() => hrOnboardingApi.activate(employeeId), 'Employee activated.')
                    }
                  >
                    Activate employee
                  </button>
                </div>
              </div>
            ) : null}

            {(status === 'PENDING_HR_APPROVAL' || status === 'HR_REVIEW') && (
              <div className={styles.formGrid}>
                <label className={styles.selectField}>
                  <span>Reject — remarks (required)</span>
                  <textarea rows={2} value={rejectRemarks} onChange={(e) => setRejectRemarks(e.target.value)} />
                </label>
                <div className={styles.submitRow}>
                  <button
                    type="button"
                    className={`${styles.tableButton} ${styles.tableButtonDanger}`}
                    onClick={() => {
                      if (!rejectRemarks.trim()) {
                        setError('Remarks are required to reject.');
                        return;
                      }
                      run(() => hrOnboardingApi.reject(employeeId, { remarks: rejectRemarks.trim() }), 'Employee rejected.');
                    }}
                  >
                    Reject employee
                  </button>
                </div>
              </div>
            )}

            {(status === 'PENDING_HR_APPROVAL' || status === 'HR_REVIEW') && (
              <div className={styles.formGrid}>
                <label className={styles.selectField}>
                  <span>Query to Admin — reason</span>
                  <select value={queryReason} onChange={(e) => setQueryReason(e.target.value)}>
                    {QUERY_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.selectField}>
                  <span>Query remarks (required)</span>
                  <textarea rows={3} value={queryRemarks} onChange={(e) => setQueryRemarks(e.target.value)} />
                </label>
                <div className={styles.submitRow}>
                  <button
                    type="button"
                    className={styles.tableButton}
                    onClick={() => {
                      if (!queryRemarks.trim()) {
                        setError('Query remarks are required.');
                        return;
                      }
                      run(
                        () => hrOnboardingApi.queryToAdmin(employeeId, { reason: queryReason, remarks: queryRemarks.trim() }),
                        'Query sent to Admin.'
                      );
                    }}
                  >
                    Send query to Admin
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className={styles.submitRow}>
            <button type="button" className={styles.tableButtonSecondary} onClick={() => navigate('/hr/employee-queue')}>
              Back to queue
            </button>
          </div>
        </Card>

        <Card title="Timeline" subtitle="System of record for onboarding events.">
          <ul className={styles.list}>
            {timeline.length === 0 ? <li>No timeline events yet.</li> : null}
            {timeline.map((ev) => (
              <li key={ev.id}>
                <strong>{ev.eventType}</strong> — {formatDateTime(ev.createdAt)}
                {ev.performedByName ? ` (${ev.performedByName})` : ''}
                {ev.details ? <div className={styles.meta}>{ev.details}</div> : null}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="HR audit log" subtitle="HR-only actions with performer and remarks.">
          <ul className={styles.list}>
            {audit.length === 0 ? <li>No audit entries yet.</li> : null}
            {audit.map((log) => (
              <li key={log.id}>
                <strong>{log.action}</strong> — {formatDateTime(log.createdAt)}
                {log.performedByName ? ` (${log.performedByName})` : ''}
                {log.remarks ? <div className={styles.meta}>{log.remarks}</div> : null}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}

export default HREmployeeDetail;
