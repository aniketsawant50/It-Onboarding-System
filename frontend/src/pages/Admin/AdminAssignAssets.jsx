import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Input from '../../components/UI/Input/Input';
import MainLayout from '../../layouts/MainLayout';
import { assetApi, assetHistoryApi, userApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import adminLinks from './adminLinks';
import styles from './Dashboard.module.css';

function AdminAssignAssets() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ name: '', type: '', serialNumber: '', assignedTo: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: userData }, { data: assetData }, { data: historyData }] = await Promise.all([
          userApi.getAll(),
          assetApi.getAll(),
          assetHistoryApi.getAll()
        ]);
        setUsers(userData.filter((user) => user.role !== 'ADMIN'));
        setAssets(assetData);
        setHistory(historyData);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load admin asset data.');
      }
    };

    load();
  }, []);

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
      const payload = { ...form, assignedTo: Number(form.assignedTo) };
      const { data } = await assetApi.create(payload);
      setAssets((current) => [...current, data]);
      const { data: historyData } = await assetHistoryApi.getAll();
      setHistory(historyData);
      setMessage(`Assigned ${data.name} successfully.`);
      setForm({ name: '', type: '', serialNumber: '', assignedTo: '' });
      window.setTimeout(() => {
        navigate('/admin', { state: { refresh: Date.now() } });
      }, 1200);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to assign asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout links={adminLinks} title="Assign Assets">
      <div className={styles.adminGrid}>
        <Card title="Assign Laptop / Access" subtitle="Allocate equipment and system access to employees.">
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <Input label="Asset Name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Asset Type" name="type" value={form.type} onChange={handleChange} required />
            <Input label="Serial Number" name="serialNumber" value={form.serialNumber} onChange={handleChange} />
            <label className={styles.selectField}>
              <span>Assign To</span>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} required>
                <option value="">Select employee</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </label>
            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.success}>{message}</p> : null}
            <div className={styles.submitRow}>
              <Button type="submit">{loading ? 'Assigning...' : 'Assign Asset'}</Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin', { state: { refresh: Date.now() } })}>
                Back to Dashboard
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Recent Assignments" subtitle="Review the latest device and access allocations.">
          <ul className={styles.list}>
            {history.slice(-6).reverse().map((entry) => (
              <li key={entry.id}>
                {entry.asset?.name || 'Asset'} for {entry.assignedTo?.name || 'Assigned user'} on {formatDateTime(entry.assignedDate || entry.assignmentDate)}
              </li>
            ))}
            {!history.length ? <li>No assets assigned yet.</li> : null}
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}

export default AdminAssignAssets;
