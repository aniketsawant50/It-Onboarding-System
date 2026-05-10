import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { taskApi, userApi } from '../../services/api';
import managerLinks from './managerLinks';
import { formatStatus, getStatusTone } from './managerHelpers';
import styles from '../Admin/Dashboard.module.css';

function ManagerTaskBoard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadBoard = async () => {
    try {
      const [{ data: userData }, { data: taskData }] = await Promise.all([
        userApi.getAll(),
        taskApi.getAll()
      ]);
      setUsers(userData.filter((user) => user.role === 'EMPLOYEE'));
      setTasks(taskData);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load task board.');
    }
  };

  useEffect(() => {
    loadBoard();
  }, []);

  const taskRows = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        assigneeName: task.assignedTo?.name || 'Unassigned',
        assigneeUsername: task.assignedTo?.username || 'N/A'
      })),
    [tasks]
  );

  const handleStatusUpdate = async (taskId, newStatus, taskTitle) => {
    setError('');
    setMessage('');
    try {
      await taskApi.updateStatus(taskId, { status: newStatus });
      setMessage(`Task "${taskTitle}" marked as ${newStatus}.`);
      await loadBoard();
    } catch (actionError) {
      setError(actionError.response?.data?.message || 'Unable to update task status.');
    }
  };

  const columns = [
    { key: 'title', header: 'Task' },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (row) => `${row.assigneeName} (${row.assigneeUsername})`
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`${styles.chip} ${styles[getStatusTone(row.status)]}`}>
          {formatStatus(row.status)}
        </span>
      )
    },
    { key: 'description', header: 'Description' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className={styles.tableActions}>
          {row.status !== 'COMPLETED' && (
            <button
              className={styles.tableButton}
              type="button"
              onClick={() => handleStatusUpdate(row.id, 'IN_PROGRESS', row.title)}
            >
              In Progress
            </button>
          )}
          {row.status !== 'COMPLETED' && (
            <button
              className={styles.tableButton}
              type="button"
              onClick={() => handleStatusUpdate(row.id, 'COMPLETED', row.title)}
            >
              Complete
            </button>
          )}
          {row.status === 'COMPLETED' && (
            <span className={styles.tableButtonDisabled}>✓ Completed</span>
          )}
        </div>
      )
    }
  ];

  const stats = useMemo(() => {
    const totalTasks = taskRows.length;
    const completedTasks = taskRows.filter((task) => task.status === 'COMPLETED').length;
    const inProgressTasks = taskRows.filter((task) => task.status === 'IN_PROGRESS').length;
    const pendingTasks = taskRows.filter((task) => task.status === 'PENDING').length;

    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      pending: pendingTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }, [taskRows]);

  return (
    <MainLayout links={managerLinks} title="Task Board">
      <div className={styles.adminGrid}>
        <Card title="Team Task Board" subtitle="Track all tasks assigned to your team members and monitor progress.">
          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          <Table columns={columns} rows={taskRows} emptyMessage="No tasks assigned yet." />
        </Card>
        <Card title="Board Summary" subtitle="See task completion metrics at a glance.">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryTile}>
              <p>Total Tasks</p>
              <strong>{stats.total}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Pending</p>
              <strong>{stats.pending}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>In Progress</p>
              <strong>{stats.inProgress}</strong>
            </div>
            <div className={styles.summaryTile}>
              <p>Completed</p>
              <strong>{stats.completed}</strong>
            </div>
          </div>
          <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Team Completion Rate</p>
            <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '30px', position: 'relative' }}>
              <div
                style={{
                  background: '#4caf50',
                  height: '100%',
                  borderRadius: '4px',
                  width: `${stats.completionRate}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {stats.completionRate}%
              </div>
            </div>
          </div>
          <div className={styles.submitRow}>
            <button
              className={styles.tableButton}
              type="button"
              onClick={() => navigate('/manager/assign-task')}
            >
              Assign New Task
            </button>
            <button
              className={styles.tableButton}
              type="button"
              onClick={() => navigate('/manager', { state: { refresh: Date.now() } })}
            >
              Back to Dashboard
            </button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export default ManagerTaskBoard;
