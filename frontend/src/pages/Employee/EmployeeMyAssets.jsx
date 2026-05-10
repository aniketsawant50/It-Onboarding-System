import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { assetApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import employeeLinks from './employeeLinks';
import { getStatusTone, getCurrentUserFromStorage } from './employeeHelpers';
import styles from '../Admin/Dashboard.module.css';

function EmployeeMyAssets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState('');

  const currentUser = getCurrentUserFromStorage();

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const { data } = await assetApi.getAll();
        // Filter assets assigned to current employee
        const myAssets = data.filter((asset) => asset.assignedTo?.id === currentUser?.id);
        setAssets(myAssets);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load your assigned assets.');
      }
    };

    if (currentUser) {
      loadAssets();
    }
  }, [currentUser]);

  const assetStats = useMemo(() => {
    const total = assets.length;
    const approved = assets.filter((asset) => asset.status === 'APPROVED').length;
    const pending = assets.filter((asset) => asset.status === 'PENDING' || asset.status === 'REJECTED').length;

    return { total, approved, pending };
  }, [assets]);

  const columns = [
    { key: 'name', header: 'Asset Name' },
    { key: 'type', header: 'Type' },
    { key: 'serialNumber', header: 'Serial Number' },
    {
      key: 'assignedDate',
      header: 'Assigned Date',
      render: (row) => formatDateTime(row.assignedDate) || 'Not available'
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusText = row.status === 'APPROVED' ? 'Approved' :
                          row.status === 'REJECTED' ? 'Rejected' : 'Pending Approval';
        return (
          <span className={`${styles.chip} ${styles[getStatusTone(row.status)]}`}>
            {statusText}
          </span>
        );
      }
    }
  ];

  return (
    <MainLayout links={employeeLinks} title="My Assets">
      <div className={styles.adminGrid}>
        <Card title="My Assigned Equipment & Assets" subtitle="Equipment and assets assigned to you for your role.">
          {error ? <p className={styles.error}>{error}</p> : null}
          <Table columns={columns} rows={assets} emptyMessage="No assets assigned yet. They will appear here when assigned by your manager." />
        </Card>
        <Card title="Asset Overview" subtitle="Summary of your assigned assets.">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryTile}>
              <p>Total Assets</p>
              <strong>{assetStats.total}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Approved</p>
              <strong>{assetStats.approved}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Pending Approval</p>
              <strong>{assetStats.pending}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Approval Rate</p>
              <strong>
                {assetStats.total ? Math.round((assetStats.approved / assetStats.total) * 100) : 0}%
              </strong>
            </div>
          </div>
          <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Asset Approval Status</p>
            <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '30px', position: 'relative' }}>
              <div
                style={{
                  background: '#ff9800',
                  height: '100%',
                  borderRadius: '4px',
                  width: `${assetStats.total ? Math.round((assetStats.approved / assetStats.total) * 100) : 0}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {assetStats.total ? Math.round((assetStats.approved / assetStats.total) * 100) : 0}%
              </div>
            </div>
          </div>
          <div className={styles.submitRow}>
            <button
              className={styles.tableButton}
              type="button"
              onClick={() => navigate('/employee', { state: { refresh: Date.now() } })}
            >
              Back to Dashboard
            </button>
          </div>
        </Card>
        <Card title="Asset Care Guidelines" subtitle="Help us maintain company equipment.">
          <ul className={styles.list}>
            <li>Treat all assigned assets with care - they are company property</li>
            <li>Keep equipment clean and in good working condition</li>
            <li>Report any damage or issues immediately to your manager</li>
            <li>Use equipment only for work-related purposes unless otherwise authorized</li>
            <li>Secure your equipment when not in use to prevent loss or theft</li>
            <li>Follow all security protocols when using company hardware</li>
            <li>Return all assets in good condition when leaving the company</li>
            <li>Contact IT support for technical issues with equipment</li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}

export default EmployeeMyAssets;
