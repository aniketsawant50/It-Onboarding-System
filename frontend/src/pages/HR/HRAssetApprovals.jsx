import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, hrOnboardingApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import hrLinks from './hrLinks';
import { formatStatus, getStatusTone } from './hrHelpers';
import styles from '../Admin/Dashboard.module.css';

function isPendingAssetStatus(status) {
  const s = (status || '').toUpperCase();
  return s === 'PENDING_APPROVAL' || s === 'PENDING';
}

function HRAssetApprovals() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadAssets = async () => {
    try {
      const { data } = await assetApi.getAll();
      setAssets(data.filter((asset) => asset.assignedTo?.role === 'EMPLOYEE'));
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load assigned assets.');
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleApprove = async (asset) => {
    setError('');
    setMessage('');
    const employeeId = asset.assignedTo?.id;
    if (!employeeId) {
      setError('Asset is not assigned to an employee.');
      return;
    }
    try {
      await hrOnboardingApi.approveAsset(employeeId, asset.id);
      setMessage(`Approved: ${asset.name}`);
      await loadAssets();
    } catch (actionError) {
      setError(actionError.response?.data?.message || 'Unable to approve the asset.');
    }
  };

  const handleReject = async (asset) => {
    setError('');
    setMessage('');
    const employeeId = asset.assignedTo?.id;
    if (!employeeId) {
      setError('Asset is not assigned to an employee.');
      return;
    }
    const remarks = window.prompt('Optional remarks for rejection (saved in timeline):', '') || '';
    try {
      await hrOnboardingApi.rejectAsset(employeeId, asset.id, { remarks });
      setMessage(`Rejected: ${asset.name}`);
      await loadAssets();
    } catch (actionError) {
      setError(actionError.response?.data?.message || 'Unable to reject the asset.');
    }
  };

  const pendingAssets = useMemo(() => assets.filter((a) => isPendingAssetStatus(a.status)), [assets]);

  const columns = [
    { key: 'name', header: 'Asset' },
    { key: 'type', header: 'Type' },
    {
      key: 'assignedTo',
      header: 'Employee',
      render: (row) => row.assignedTo?.name || 'Unassigned'
    },
    {
      key: 'assignedDate',
      header: 'Assigned date',
      render: (row) => formatDateTime(row.assignedDate) || '—'
    },
    {
      key: 'status',
      header: 'Approval status',
      render: (row) => (
        <span className={`${styles.chip} ${styles[getStatusTone(row.status)]}`}>{formatStatus(row.status)}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        isPendingAssetStatus(row.status) ? (
          <div className={styles.tableActions}>
            <button className={styles.tableButton} type="button" onClick={() => handleApprove(row)}>
              Approve
            </button>
            <button className={`${styles.tableButton} ${styles.tableButtonDanger}`} type="button" onClick={() => handleReject(row)}>
              Reject
            </button>
          </div>
        ) : (
          <span className={`${styles.chip} ${styles.chipMuted}`}>No action</span>
        )
    }
  ];

  return (
    <MainLayout links={hrLinks} title="HR asset approvals">
      <div className={styles.adminGrid}>
        <Card title="Assigned assets" subtitle="HR decisions are recorded on the employee timeline and reflected on the employee dashboard.">
          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          <Table columns={columns} rows={assets} emptyMessage="No employee assets have been assigned yet." />
        </Card>
        <Card title="Snapshot" subtitle="Quick counts for your queue.">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryTile}>
              <p>Waiting approval</p>
              <strong>{pendingAssets.length}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Approved</p>
              <strong>{assets.filter((a) => (a.status || '').toUpperCase() === 'APPROVED').length}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Rejected</p>
              <strong>{assets.filter((a) => (a.status || '').toUpperCase() === 'REJECTED').length}</strong>
            </div>
          </div>
          <div className={styles.submitRow}>
            <button className={styles.tableButton} type="button" onClick={() => navigate('/hr', { state: { refresh: Date.now() } })}>
              Back to HR dashboard
            </button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export default HRAssetApprovals;
