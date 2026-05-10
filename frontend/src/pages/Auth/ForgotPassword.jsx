import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Input from '../../components/UI/Input/Input';
import { authApi } from '../../services/api';
import styles from './PasswordFlow.module.css';

function ForgotPassword() {
  const [form, setForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password must match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword(form);
      setSuccess(data.message || 'Password updated successfully.');
      setForm({
        email: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card
        title="Forgot Password"
        subtitle="Enter your email and choose a new password"
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Registered Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <p className={styles.help}>
            Old password is not required here. The email must already exist in the database.
          </p>
          {error ? <p className={styles.error}>{error}</p> : null}
          {success ? <p className={styles.success}>{success}</p> : null}
          <Button type="submit">{loading ? 'Saving...' : 'Save Password'}</Button>
        </form>
        <div className={styles.footer}>
          <Link to="/login">Back to Login</Link>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPassword;
