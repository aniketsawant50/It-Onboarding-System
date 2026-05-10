import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Input from '../../components/UI/Input/Input';
import MainLayout from '../../layouts/MainLayout';
import { userApi } from '../../services/api';
import adminLinks from './adminLinks';
import styles from './Dashboard.module.css';

const roleOptions = ['HR', 'MANAGER', 'EMPLOYEE'];

function AdminCreateEmployee() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    status: 'ACTIVE'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await userApi.create(form);
      setMessage(`Created ${data.name} with role ${data.role}.`);
      setForm({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        status: 'ACTIVE'
      });
      window.setTimeout(() => {
        navigate('/admin', { state: { refresh: Date.now() } });
      }, 1200);
    } catch (submitError) {
      if (submitError.response?.status === 401 || submitError.response?.status === 403) {
        setError('Your admin session is invalid or expired. Please log in again.');
      } else {
        setError(submitError.response?.data?.message || 'Unable to create employee.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout links={adminLinks} title="Create Employee Account">
      <Card title="New Employee Account" subtitle="Create HR, Manager, or Employee access from the admin workspace.">
        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Username" name="username" value={form.username} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input label="Temporary Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          <label className={styles.selectField}>
            <span>Role</span>
            <select name="role" value={form.role} onChange={handleChange}>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.selectField}>
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          <div className={styles.submitRow}>
            <Button type="submit">{loading ? 'Creating...' : 'Create Employee Account'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin', { state: { refresh: Date.now() } })}>
              Back to Dashboard
            </Button>
          </div>
        </form>
      </Card>
    </MainLayout>
  );
}

export default AdminCreateEmployee;
