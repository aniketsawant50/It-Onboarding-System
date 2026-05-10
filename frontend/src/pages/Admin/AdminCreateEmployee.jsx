import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Input from '../../components/UI/Input/Input';
import MainLayout from '../../layouts/MainLayout';
import { userApi } from '../../services/api';
import { isNotEmpty, isValidEmail, isValidPhone } from '../../utils/validators';
import adminLinks from './adminLinks';
import styles from './Dashboard.module.css';

const roleOptions = ['HR', 'MANAGER', 'EMPLOYEE'];
const genderOptions = ['Male', 'Female', 'Other'];
const initialForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  contactNumber: '',
  gender: '',
  username: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  status: 'ACTIVE'
};

function AdminCreateEmployee() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};

    if (!isNotEmpty(form.firstName)) errors.firstName = 'First name is required.';
    if (!isNotEmpty(form.lastName)) errors.lastName = 'Last name is required.';
    if (!isNotEmpty(form.dateOfBirth)) errors.dateOfBirth = 'Date of birth is required.';
    if (!isNotEmpty(form.contactNumber)) {
      errors.contactNumber = 'Contact number is required.';
    } else if (!isValidPhone(form.contactNumber)) {
      errors.contactNumber = 'Enter a valid contact number.';
    }
    if (!isNotEmpty(form.gender)) errors.gender = 'Gender is required.';
    if (!isNotEmpty(form.username)) errors.username = 'Username is required.';
    if (!isNotEmpty(form.email)) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!isNotEmpty(form.password)) errors.password = 'Temporary password is required.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      setError('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...form,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`
      };
      const { data } = await userApi.create(payload);
      setMessage(`Created ${data.name} with role ${data.role}.`);
      setForm(initialForm);
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
          <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={fieldErrors.firstName} required />
          <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={fieldErrors.lastName} required />
          <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} error={fieldErrors.dateOfBirth} required />
          <Input label="Contact Number" name="contactNumber" type="tel" value={form.contactNumber} onChange={handleChange} error={fieldErrors.contactNumber} required />
          <label className={styles.selectField}>
            <span>Gender</span>
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Select gender</option>
              {genderOptions.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
            {fieldErrors.gender ? <p className={styles.error}>{fieldErrors.gender}</p> : null}
          </label>
          <Input label="Username" name="username" value={form.username} onChange={handleChange} error={fieldErrors.username} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={fieldErrors.email} required />
          <Input label="Temporary Password" name="password" type="password" value={form.password} onChange={handleChange} error={fieldErrors.password} required />
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
