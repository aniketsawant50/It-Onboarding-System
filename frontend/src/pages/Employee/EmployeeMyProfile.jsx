import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card/Card';
import MainLayout from '../../layouts/MainLayout';
import { userApi } from '../../services/api';
import employeeLinks from './employeeLinks';
import { getCurrentUserFromStorage } from './employeeHelpers';
import styles from '../Admin/Dashboard.module.css';

function EmployeeMyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    joiningDate: ''
  });

  const currentUser = getCurrentUserFromStorage();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data } = await userApi.getById(currentUser?.id);
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          designation: data.designation || '',
          joiningDate: data.joiningDate || ''
        });
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load profile information.');
      }
    };

    if (currentUser?.id) {
      loadUserProfile();
    }
  }, [currentUser?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await userApi.update(currentUser?.id, formData);
      setSuccessMessage('Profile updated successfully!');
      // Update localStorage with new user data
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout links={employeeLinks} title="My Profile">
      <div className={styles.adminGrid}>
        <Card title="My Profile" subtitle="View and update your profile information.">
          {error ? <p className={styles.error}>{error}</p> : null}
          {successMessage ? <p className={styles.success}>{successMessage}</p> : null}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Your designation"
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label>Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  disabled
                />
              </div>
            </div>

            <div className={styles.submitRow}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => navigate('/employee', { state: { refresh: Date.now() } })}
                disabled={loading}
              >
                Back to Dashboard
              </button>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </Card>

        <Card title="Profile Information" subtitle="Summary of your profile details.">
          <div className={styles.profileInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Full Name:</span>
              <span>{formData.firstName} {formData.lastName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email:</span>
              <span>{formData.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Phone:</span>
              <span>{formData.phone || 'Not provided'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Designation:</span>
              <span>{formData.designation}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Joining Date:</span>
              <span>{formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </Card>

        <Card title="Important Notes" subtitle="Information about your profile.">
          <ul className={styles.list}>
            <li>Some fields (name, email, designation) are locked and managed by HR</li>
            <li>Contact HR if you need to update locked fields</li>
            <li>You can update your phone number to keep your contact information current</li>
            <li>Your profile information is visible to your manager and HR team</li>
            <li>Keep your information up to date for important company communications</li>
            <li>If you notice any errors in your profile, contact HR immediately</li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}

export default EmployeeMyProfile;
