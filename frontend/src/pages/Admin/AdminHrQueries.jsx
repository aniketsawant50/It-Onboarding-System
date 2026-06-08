import { useEffect, useState } from 'react';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { adminOnboardingApi } from '../../services/api';
import adminLinks from './adminLinks';
import styles from './Dashboard.module.css';

function AdminHrQueries() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    try {
      const { data } = await adminOnboardingApi.listHrQueries();
      setRows(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load HR queries.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      organizationEmail: row.organizationEmail,
      department: row.department || '',
      jobTitle: row.jobTitle || '',
      joiningDate: row.joiningDate || '',
      role: 'EMPLOYEE'
    });
  };

  const saveEdit = async (id) => {
    setError('');
    setMessage('');
    try {
      await adminOnboardingApi.updateEmployeeForQuery(id, {
        ...form,
        role: 'EMPLOYEE',
        joiningDate: form.joiningDate
      });
      setMessage('Employee record updated.');
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed.');
    }
  };

  const resubmit = async (id) => {
    setError('');
    setMessage('');
    try {
      await adminOnboardingApi.resubmitToHr(id);
      setMessage('Resubmitted to HR.');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Resubmit failed.');
    }
  };

  const columns = [
    { key: 'employeeId', header: 'Employee ID' },
    { key: 'name', header: 'Name' },
    { key: 'lastQueryReason', header: 'Reason' },
    {
      key: 'lastQueryRemarks',
      header: 'HR remarks',
      render: (row) => row.lastQueryRemarks || '—'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className={styles.tableActions}>
          <button type="button" className={styles.tableButton} onClick={() => startEdit(row)}>
            Edit
          </button>
          <button type="button" className={styles.tableButton} onClick={() => resubmit(row.id)}>
            Resubmit to HR
          </button>
        </div>
      )
    }
  ];

  return (
    <MainLayout links={adminLinks} title="HR onboarding queries">
      <div className={styles.adminGrid}>
        <Card title="Pending admin action" subtitle="Fix employee master data, then resubmit to HR for another review cycle.">
          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          <Table columns={columns} rows={rows} emptyMessage="No pending HR queries." />
        </Card>

        {editingId ? (
          <Card title="Update employee (query fix)" subtitle="All fields are required by the API contract.">
            <div className={styles.formGrid}>
              <label className={styles.selectField}>
                <span>First name</span>
                <input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
              </label>
              <label className={styles.selectField}>
                <span>Last name</span>
                <input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
              </label>
              <label className={styles.selectField}>
                <span>Personal email</span>
                <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </label>
              <label className={styles.selectField}>
                <span>Organization email</span>
                <input
                  value={form.organizationEmail}
                  onChange={(e) => setForm((f) => ({ ...f, organizationEmail: e.target.value }))}
                />
              </label>
              <label className={styles.selectField}>
                <span>Job title</span>
                <input value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} />
              </label>
              <label className={styles.selectField}>
                <span>Joining date</span>
                <input
                  type="date"
                  value={form.joiningDate ? String(form.joiningDate).slice(0, 10) : ''}
                  onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value }))}
                />
              </label>
            </div>
            <div className={styles.submitRow}>
              <button type="button" className={styles.tableButton} onClick={() => saveEdit(editingId)}>
                Save changes
              </button>
              <button type="button" className={styles.tableButtonSecondary} onClick={() => setEditingId(null)}>
                Cancel
              </button>
            </div>
          </Card>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default AdminHrQueries;
