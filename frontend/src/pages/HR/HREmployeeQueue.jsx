import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { hrOnboardingApi } from '../../services/api';
import hrLinks from './hrLinks';
import { EMPLOYEE_LIFECYCLE_STATUSES, formatStatus, getStatusTone } from './hrHelpers';
import styles from '../Admin/Dashboard.module.css';

function HREmployeeQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const loadQueue = async () => {
    try {
      const { data } = await hrOnboardingApi.listEmployees({
        search: search.trim() || undefined,
        status: status || undefined,
        jobTitle: jobTitle.trim() || undefined
      });
      setRows(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load the HR employee queue.');
    }
  };

  useEffect(() => {
    loadQueue();
    const intervalId = window.setInterval(loadQueue, 20000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadQueue();
  };

  const columns = useMemo(
    () => [
      { key: 'employeeId', header: 'Employee ID' },
      { key: 'name', header: 'Employee' },
      { key: 'username', header: 'Username' },
      { key: 'organizationEmail', header: 'Org email' },
      {
        key: 'status',
        header: 'Lifecycle',
        render: (row) => (
          <span className={`${styles.chip} ${styles[getStatusTone(row.status)]}`}>
            {formatStatus(row.status)}
          </span>
        )
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className={styles.tableActions}>
            <button className={styles.tableButton} type="button" onClick={() => navigate(`/hr/employees/${row.id}`)}>
              Open
            </button>
          </div>
        )
      }
    ],
    [navigate]
  );

  return (
    <MainLayout links={hrLinks} title="HR employee queue">
      <div className={styles.adminGrid}>
        <Card title="Filters" subtitle="Search and narrow the employee list. Leave status blank to include every lifecycle stage.">
          <form className={styles.formGrid} onSubmit={handleSearch}>
            <label className={styles.selectField}>
              <span>Search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, username, employee ID"
              />
            </label>
            <label className={styles.selectField}>
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All</option>
                {EMPLOYEE_LIFECYCLE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {formatStatus(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectField}>
              <span>Job title</span>
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </label>
            <div className={styles.submitRow}>
              <button className={styles.tableButton} type="submit">
                Apply filters
              </button>
            </div>
          </form>
        </Card>

        <Card title="Employees" subtitle="Use Open to view timeline, audit trail, and workflow actions.">
          {error ? <p className={styles.error}>{error}</p> : null}
          <Table columns={columns} rows={rows} emptyMessage="No employees match the current filters." />
        </Card>
      </div>
    </MainLayout>
  );
}

export default HREmployeeQueue;
