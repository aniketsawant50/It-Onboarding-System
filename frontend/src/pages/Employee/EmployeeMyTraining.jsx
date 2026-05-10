import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { trainingApi } from '../../services/api';
import employeeLinks from './employeeLinks';
import { getStatusTone, getCurrentUserFromStorage } from './employeeHelpers';
import styles from '../Admin/Dashboard.module.css';

function EmployeeMyTraining() {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [error, setError] = useState('');

  const currentUser = getCurrentUserFromStorage();

  useEffect(() => {
    const loadTrainings = async () => {
      try {
        const { data } = await trainingApi.getAll();
        // Filter trainings assigned to current employee
        const myTrainings = data.filter((training) => training.employeeId === currentUser?.id);
        setTrainings(myTrainings);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load your training modules.');
      }
    };

    if (currentUser) {
      loadTrainings();
    }
  }, [currentUser]);

  const trainingStats = useMemo(() => {
    const total = trainings.length;
    const completed = trainings.filter((training) => training.completionStatus).length;
    const pending = total - completed;

    return { total, completed, pending };
  }, [trainings]);

  const columns = [
    { key: 'title', header: 'Training Module' },
    { key: 'description', header: 'Description' },
    {
      key: 'completionStatus',
      header: 'Status',
      render: (row) => (
        <span className={`${styles.chip} ${row.completionStatus ? styles.success : styles.warning}`}>
          {row.completionStatus ? 'Completed' : 'Pending'}
        </span>
      )
    },
    {
      key: 'completedDate',
      header: 'Completed On',
      render: (row) => (row.completedDate ? new Date(row.completedDate).toLocaleDateString() : '-')
    }
  ];

  return (
    <MainLayout links={employeeLinks} title="My Training">
      <div className={styles.adminGrid}>
        <Card title="My Assigned Training" subtitle="Complete these training modules to ensure successful onboarding.">
          {error ? <p className={styles.error}>{error}</p> : null}
          <Table columns={columns} rows={trainings} emptyMessage="No training modules assigned yet. Check back soon!" />
        </Card>
        <Card title="Training Progress" subtitle="Your training completion overview.">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryTile}>
              <p>Total Modules</p>
              <strong>{trainingStats.total}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Completed</p>
              <strong>{trainingStats.completed}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Pending</p>
              <strong>{trainingStats.pending}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Completion %</p>
              <strong>
                {trainingStats.total ? Math.round((trainingStats.completed / trainingStats.total) * 100) : 0}%
              </strong>
            </div>
          </div>
          <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Training Completion Progress</p>
            <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '30px', position: 'relative' }}>
              <div
                style={{
                  background: '#2196F3',
                  height: '100%',
                  borderRadius: '4px',
                  width: `${trainingStats.total ? Math.round((trainingStats.completed / trainingStats.total) * 100) : 0}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {trainingStats.total ? Math.round((trainingStats.completed / trainingStats.total) * 100) : 0}%
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
        <Card title="Training Tips" subtitle="Make the most of your training experience.">
          <ul className={styles.list}>
            <li>Allocate dedicated time for each training module</li>
            <li>Take detailed notes during training sessions</li>
            <li>Don't hesitate to ask questions - understanding is key</li>
            <li>Complete trainings in the recommended order when applicable</li>
            <li>Review completed trainings periodically to reinforce learning</li>
            <li>Reach out to your manager or HR if you need additional support</li>
            <li>Remember that training is an investment in your professional growth</li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}

export default EmployeeMyTraining;
