import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, userApi } from '../../services/api';
import hrLinks from './hrLinks';
import { formatStatus, getStatusTone } from './hrHelpers';
import styles from '../Admin/Dashboard.module.css';

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

  const handleDecision = async (asset, assetStatus, employeeStatus, successMessage) => {
    setError('');
    setMessage('');
    try {
      await assetApi.updateStatus(asset.id, { status: assetStatus });
      if (asset.assignedTo?.id) {
        await userApi.updateStatus(asset.assignedTo.id, { status: employeeStatus });
      }
      setMessage(successMessage);
      await loadAssets();
    } catch (actionError) {
      setError(actionError.response?.data?.message || 'Unable to update the asset approval.');
    }
  };

  const pendingAssets = useMemo(
    () => assets.filter((asset) => asset.status === 'PENDING'),
    [assets]
  );

  const columns = [
    { key: 'name', header: 'Asset' },
    { key: 'type', header: 'Type' },
    {
      key: 'assignedTo',
      header: 'Employee',
      render: (row) => row.assignedTo?.name || 'Unassigned'
    },
    {
      key: 'status',
      header: 'Approval Status',
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
          <button
            className={styles.tableButton}
            type="button"
            onClick={() =>
              handleDecision(
                row,
                'APPROVED',
                'ASSET_APPROVED',
                `${row.name} approved and linked onboarding stage updated.`
              )
            }
          >
            Approve
          </button>
          <button
            className={`${styles.tableButton} ${styles.tableButtonDanger}`}
            type="button"
            onClick={() =>
              handleDecision(
                row,
                'REJECTED',
                'ASSET_REVIEW_REQUIRED',
                `${row.name} sent back for correction.`
              )
            }
          >
            Reject
          </button>
        </div>
      )
    }
  ];

  return (
    <MainLayout links={hrLinks} title="HR Asset Approvals">
      <div className={styles.adminGrid}>
        <Card title="Assigned Assets" subtitle="Approve the laptops and access packages created by Admin.">
          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          <Table columns={columns} rows={assets} emptyMessage="No employee assets have been assigned yet." />
        </Card>
        <Card title="Approval Snapshot" subtitle="See where IT readiness stands before the manager handoff.">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryTile}>
              <p>Waiting Approval</p>
              <strong>{pendingAssets.length}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Approved</p>
              <strong>{assets.filter((asset) => asset.status === 'APPROVED').length}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Returned</p>
              <strong>{assets.filter((asset) => asset.status === 'REJECTED').length}</strong>
            </div>
          </div>
          <div className={styles.submitRow}>
            <button
              className={styles.tableButton}
              type="button"
              onClick={() => navigate('/hr', { state: { refresh: Date.now() } })}
            >
              Back to HR Dashboard
            </button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export default HRAssetApprovals;
