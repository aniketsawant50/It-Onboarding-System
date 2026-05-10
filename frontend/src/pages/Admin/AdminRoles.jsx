import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { userApi } from '../../services/api';
import adminLinks from './adminLinks';
import styles from './Dashboard.module.css';

const roleOptions = ['HR', 'MANAGER', 'EMPLOYEE'];
const statusOptions = ['ACTIVE', 'PENDING', 'INACTIVE'];

function AdminRoles() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [status, setStatus] = useState('ACTIVE');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      const { data } = await userApi.getAll();
      setUsers(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load roles.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSelectUser = (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    const user = users.find((entry) => String(entry.id) === userId);
    if (user) {
      setRole(user.role);
      setStatus(user.status);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await userApi.updateAccess(selectedUserId, { role, status });
      setMessage('Roles and permissions updated successfully.');
      await loadUsers();
      window.setTimeout(() => {
        navigate('/admin', { state: { refresh: Date.now() } });
      }, 1200);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to update role access.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'username', header: 'Username' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' }
  ];

  return (
    <MainLayout links={adminLinks} title="Manage Roles and Permissions">
      <div className={styles.adminGrid}>
        <Card title="Access Control" subtitle="Change employee roles and control account status.">
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <label className={styles.selectField}>
              <span>Select User</span>
              <select value={selectedUserId} onChange={handleSelectUser} required>
                <option value="">Choose user</option>
                {users.filter((user) => user.role !== 'ADMIN').map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.username})
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectField}>
              <span>Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectField}>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.success}>{message}</p> : null}
            <div className={styles.submitRow}>
              <Button type="submit">{loading ? 'Updating...' : 'Update Role Access'}</Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin', { state: { refresh: Date.now() } })}>
                Back to Dashboard
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Current Access Matrix" subtitle="Review the current role and status for each account.">
          <Table columns={columns} rows={users} emptyMessage="No user access records found." />
        </Card>
      </div>
    </MainLayout>
  );
}

export default AdminRoles;
