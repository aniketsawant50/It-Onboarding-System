import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Input from '../../components/UI/Input/Input';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showDemoHint, setShowDemoHint] = useState(false);

  // Load remembered credentials on mount
  useEffect(() => {
    const remembered = localStorage.getItem('loginCredentials');
    if (remembered) {
      try {
        const { username, rememberMe } = JSON.parse(remembered);
        setForm((current) => ({
          ...current,
          username: username || '',
          rememberMe: true
        }));
      } catch (e) {
        // Invalid stored data, ignore
      }
    }
  }, []);

  // Validate individual fields
  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    if (name === 'username') {
      if (!value.trim()) {
        errors.username = 'Username is required';
      } else if (value.trim().length < 3) {
        errors.username = 'Username must be at least 3 characters';
      } else {
        delete errors.username;
      }
    }
    
    if (name === 'password') {
      if (!value) {
        errors.password = 'Password is required';
      } else if (value.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      } else {
        delete errors.password;
      }
    }
    
    return errors;
  };



  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setForm((current) => ({ ...current, [name]: fieldValue }));
    
    // Validate on change for better UX
    if (touched[name]) {
      setValidationErrors(validateField(name, fieldValue));
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setValidationErrors(validateField(name, form[name]));
  };

  const handleKeyDown = (event) => {
    // Detect caps lock
    if (event.key === 'CapsLock' || (event.shiftKey && event.key === event.key.toUpperCase())) {
      setCapsLockOn(event.getModifierState && event.getModifierState('CapsLock'));
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === 'CapsLock') {
      setCapsLockOn(event.getModifierState && event.getModifierState('CapsLock'));
    }
  };

  const handleClear = () => {
    setForm({ username: '', password: '', rememberMe: form.rememberMe });
    setValidationErrors({});
    setTouched({});
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    // Validate all fields
    const usernameErrors = validateField('username', form.username);
    const passwordErrors = validateField('password', form.password);
    const allErrors = { ...usernameErrors, ...passwordErrors };
    
    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      setTouched({ username: true, password: true });
      return;
    }
    
    setLoading(true);

    try {
      const user = await login(form);
      
      // Remember credentials if checked
      if (form.rememberMe) {
        localStorage.setItem('loginCredentials', JSON.stringify({
          username: form.username,
          rememberMe: true
        }));
      } else {
        localStorage.removeItem('loginCredentials');
      }
      
      navigate(`/${user.role.toLowerCase()}`);
    } catch (submitError) {
      setError(submitError.message || 'Login failed. Please try again.');
      // Add failed attempt feedback
      setTouched({ username: true, password: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.badge}>ONBOARDING</p>
        <h1>IT Onboarding System</h1>
        <p>
          Secure onboarding for admins, HR teams, managers, and employees with a clean
          role-based workspace after login.
        </p>
        <ul>
          <li>Sign in with username and password only for this in-house portal</li>
          <li>Super Admin creates the rest of the users and roles in the portal</li>
          <li>Use forgot password to start the email confirmation reset flow</li>
          <li>Manage onboarding work through clear role-specific actions</li>
        </ul>
      </div>

      <Card title="Secure Login" subtitle="Enter your credentials to access your dashboard.">
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Username Input */}
          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>
              <span>Username</span>
              <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your username"
              className={`${styles.inputField} ${touched.username && validationErrors.username ? styles.inputError : ''} ${touched.username && !validationErrors.username && form.username ? styles.inputSuccess : ''}`}
              disabled={loading}
              aria-label="Username"
              aria-invalid={touched.username && !!validationErrors.username}
            />
            {touched.username && validationErrors.username && (
              <span className={styles.errorMessage}>{validationErrors.username}</span>
            )}
          </div>

          {/* Password Input with Visibility Toggle */}
          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>
              <span>Password</span>
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                placeholder="Enter your password"
                className={`${styles.inputField} ${touched.password && validationErrors.password ? styles.inputError : ''} ${touched.password && !validationErrors.password && form.password ? styles.inputSuccess : ''}`}
                disabled={loading}
                aria-label="Password"
                aria-invalid={touched.password && !!validationErrors.password}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {/* Caps Lock Warning */}
            {capsLockOn && (
              <span className={styles.capsLockWarning}> Caps Lock is ON</span>
            )}
            
            {touched.password && validationErrors.password && (
              <span className={styles.errorMessage}>{validationErrors.password}</span>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className={styles.rememberMeContainer}>
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              disabled={loading}
              className={styles.checkbox}
            />
            <label htmlFor="rememberMe" className={styles.checkboxLabel}>
              Remember my username
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorAlert} role="alert">
              <span className={styles.errorIcon}></span>
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Button */}
          <Button 
            type="submit" 
            disabled={loading}
            className={styles.signInButton}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Forgot Password Link */}
          <div className={styles.links}>
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot Password?
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Login;
