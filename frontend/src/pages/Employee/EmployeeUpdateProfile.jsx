import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Input from '../../components/UI/Input/Input';
import MainLayout from '../../layouts/MainLayout';
import { userApi } from '../../services/api';
import { isNotEmpty, isValidEmail, isValidPhone } from '../../utils/validators';
import employeeLinks from './employeeLinks';
import styles from '../Admin/Dashboard.module.css';

const genderOptions = ['Male', 'Female', 'Other'];

function EmployeeUpdateProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    contactNumber: '',
    dateOfBirth: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
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
          email: data.email || '',
          contactNumber: data.contactNumber || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || ''
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
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};

    if (!isNotEmpty(form.email)) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!isNotEmpty(form.contactNumber)) {
      errors.contactNumber = 'Contact number is required.';
    } else if (!isValidPhone(form.contactNumber)) {
      errors.contactNumber = 'Enter a valid contact number.';
    }
    if (!isNotEmpty(form.dateOfBirth)) errors.dateOfBirth = 'Date of birth is required.';
    if (!isNotEmpty(form.gender)) errors.gender = 'Gender is required.';
    if (form.password && form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setError('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        email: form.email,
        contactNumber: form.contactNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender
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
            label="Email Address" 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            error={fieldErrors.email}
            required 
          />
          <Input 
            label="Contact Number" 
            name="contactNumber" 
            type="tel" 
            value={form.contactNumber} 
            onChange={handleChange} 
            error={fieldErrors.contactNumber}
            required 
          />
          <Input 
            label="Date of Birth" 
            name="dateOfBirth" 
            type="date" 
            value={form.dateOfBirth} 
            onChange={handleChange} 
            error={fieldErrors.dateOfBirth}
            required 
          />
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
            error={fieldErrors.confirmPassword}
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
