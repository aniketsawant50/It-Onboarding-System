import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Input from '../../components/UI/Input/Input';
import MainLayout from '../../layouts/MainLayout';
import { userApi } from '../../services/api';
import employeeLinks from './employeeLinks';
import styles from '../Admin/Dashboard.module.css';

function EmployeeUpdateProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await userApi.getCurrentUser();
        setForm((current) => ({
          ...current,
          name: data.name || '',
          email: data.email || ''
        }));
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load profile information.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate passwords match if changing password
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        name: form.name,
        email: form.email
      };

      if (form.password) {
        payload.password = form.password;
      }

      const { data } = await userApi.updateProfile(payload);
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(data));
      
      setMessage('Profile updated successfully!');
      setForm((current) => ({
        ...current,
        password: '',
        confirmPassword: ''
      }));

      window.setTimeout(() => {
        navigate('/employee', { state: { refresh: Date.now() } });
      }, 1200);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout links={employeeLinks} title="Update Profile">
        <Card title="Update Your Profile">
          <p className={styles.label}>Loading profile information...</p>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout links={employeeLinks} title="Update Profile">
      <Card title="Your Profile Information" subtitle="Update your personal and account details.">
        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <Input 
            label="Full Name" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Email Address" 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="New Password (optional)" 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
          />
          <Input 
            label="Confirm Password" 
            name="confirmPassword" 
            type="password" 
            value={form.confirmPassword} 
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
          />

          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}

          <div className={styles.submitRow}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate('/employee')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Profile Security Tips" subtitle="Keep your account information secure.">
        <ul className={styles.list}>
          <li>Use a strong, unique password with a mix of letters, numbers, and symbols</li>
          <li>Update your email address if it has changed or is no longer accurate</li>
          <li>Never share your login credentials with colleagues or managers</li>
          <li>Review your profile regularly to ensure all information is current</li>
          <li>Change your password periodically for enhanced security</li>
        </ul>
      </Card>
    </MainLayout>
  );
}

export default EmployeeUpdateProfile;
