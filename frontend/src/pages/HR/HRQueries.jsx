import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { hrOnboardingApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import hrLinks from './hrLinks';
import { formatStatus, getStatusTone } from './hrHelpers';
import styles from '../Admin/Dashboard.module.css';

function HRQueries() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await hrOnboardingApi.listEmployees({ status: 'QUERY_TO_ADMIN' });
      setRows(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load queries.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: 'employeeId', header: 'Employee ID' },
    { key: 'name', header: 'Employee' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`${styles.chip} ${styles[getStatusTone(row.status)]}`}>{formatStatus(row.status)}</span>
      )
    },
    {
      key: 'lastQueryAt',
      header: 'Sent at',
      render: (row) => formatDateTime(row.lastQueryAt) || '—'
    },
    { key: 'lastQueryReason', header: 'Reason' },
    {
      key: 'lastQueryRemarks',
      header: 'Remarks',
      render: (row) => row.lastQueryRemarks || '—'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button type="button" className={styles.tableButton} onClick={() => navigate(`/hr/employees/${row.id}`)}>
          Open
        </button>
      )
    }
  ];

  return (
    <MainLayout links={hrLinks} title="Queries to Admin">
      <Card title="Employees in QUERY_TO_ADMIN" subtitle="Admin must correct data and resubmit to HR. This list is read-only for HR.">
        {error ? <p className={styles.error}>{error}</p> : null}
        <Table columns={columns} rows={rows} emptyMessage="No open queries." />
      </Card>
    </MainLayout>
  );
}

export default HRQueries;
