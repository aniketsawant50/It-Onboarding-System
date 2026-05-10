import { useEffect, useState } from 'react';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import MainLayout from '../../layouts/MainLayout';
import { userApi } from '../../services/api';
import adminLinks from './adminLinks';
import styles from './Dashboard.module.css';

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'username', header: 'Username' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' }
];

function AdminEmployees() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await userApi.getAll();
        setUsers(data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load employees.');
      }
    };

    loadUsers();
  }, []);

  return (
    <MainLayout links={adminLinks} title="View All Employees">
      <Card title="Employee Directory" subtitle="Track all portal users, their roles, and onboarding status.">
        {error ? <p className={styles.error}>{error}</p> : null}
        <Table columns={columns} rows={users} emptyMessage="No employee records available." />
      </Card>
    </MainLayout>
  );
}

export default AdminEmployees;
