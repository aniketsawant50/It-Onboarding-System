import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { taskApi } from '../../services/api';
import { formatDate, formatDateTime } from '../../utils/formatters';
import employeeLinks from './employeeLinks';
import { formatStatus, getStatusTone, getCurrentUserFromStorage } from './employeeHelpers';
import styles from '../Admin/Dashboard.module.css';

function EmployeeMyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  const currentUser = getCurrentUserFromStorage();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { data } = await taskApi.getAll();
        // Filter tasks for current employee
        const myTasks = data.filter((task) => task.assignedTo?.id === currentUser?.id);
        setTasks(myTasks);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load your tasks.');
      }
    };

    if (currentUser) {
      loadTasks();
    }
  }, [currentUser]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
    const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
    const pending = tasks.filter((task) => task.status === 'PENDING').length;

    return { total, completed, inProgress, pending };
  }, [tasks]);

  const columns = [
    { key: 'title', header: 'Task Title' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`${styles.chip} ${styles[getStatusTone(row.status)]}`}>
          {formatStatus(row.status)}
        </span>
      )
    },
    {
      key: 'taskCreatedDate',
      header: 'Created Date',
      render: (row) => formatDateTime(row.taskCreatedDate) || 'Not available'
    },
    {
      key: 'completionDate',
      header: 'Completion Date',
      render: (row) => formatDate(row.completionDate) || 'Not set'
    },
    { key: 'description', header: 'Description' }
  ];

  return (
    <MainLayout links={employeeLinks} title="My Tasks">
      <div className={styles.adminGrid}>
        <Card title="My Assigned Tasks" subtitle="Complete these tasks as part of your onboarding process.">
          {error ? <p className={styles.error}>{error}</p> : null}
          <Table columns={columns} rows={tasks} emptyMessage="No tasks assigned yet. Check back later!" />
        </Card>
        <Card title="Task Summary" subtitle="Your task completion overview.">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryTile}>
              <p>Total Tasks</p>
              <strong>{taskStats.total}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Pending</p>
              <strong>{taskStats.pending}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>In Progress</p>
              <strong>{taskStats.inProgress}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Completed</p>
              <strong>{taskStats.completed}</strong>
            </div>
          </div>
          <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Task Completion Rate</p>
            <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '30px', position: 'relative' }}>
              <div
                style={{
                  background: '#4caf50',
                  height: '100%',
                  borderRadius: '4px',
                  width: `${taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
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
        <Card title="Task Guidelines" subtitle="Tips for successful onboarding task completion.">
          <ul className={styles.list}>
            <li>Read each task description carefully to understand requirements</li>
            <li>Complete tasks in the suggested order for best results</li>
            <li>Reach out to your manager if you have questions or blockers</li>
            <li>Mark tasks as complete when done - this helps track progress</li>
            <li>Some tasks may require approvals before they can be marked complete</li>
            <li>Check back regularly for new tasks assigned by your manager</li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}

export default EmployeeMyTasks;
