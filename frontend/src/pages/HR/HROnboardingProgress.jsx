import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { hrOnboardingApi } from '../../services/api';
import hrLinks from './hrLinks';
import { formatStatus, getStatusTone } from './hrHelpers';
import styles from '../Admin/Dashboard.module.css';

function HROnboardingProgress() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await hrOnboardingApi.listEmployees({});
        setRows(data);
      } catch (e) {
        setError(e.response?.data?.message || 'Unable to load onboarding progress.');
      }
    };
    load();
  }, []);

  const columns = [
    { key: 'employeeId', header: 'Employee ID' },
    { key: 'name', header: 'Employee' },
    {
      key: 'status',
      header: 'Lifecycle',
      render: (row) => (
        <span className={`${styles.chip} ${styles[getStatusTone(row.status)]}`}>{formatStatus(row.status)}</span>
      )
    },
    {
      key: 'reportingManagerName',
      header: 'Manager',
      render: (row) => row.reportingManagerName || '—'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button type="button" className={styles.tableButton} onClick={() => navigate(`/hr/employees/${row.id}`)}>
          Details
        </button>
      )
    }
  ];

  return (
    <MainLayout links={hrLinks} title="Onboarding progress">
      <Card title="All employees" subtitle="Snapshot of lifecycle status across the organization.">
        {error ? <p className={styles.error}>{error}</p> : null}
        <Table columns={columns} rows={rows} emptyMessage="No employees found." />
      </Card>
    </MainLayout>
  );
}

export default HROnboardingProgress;
