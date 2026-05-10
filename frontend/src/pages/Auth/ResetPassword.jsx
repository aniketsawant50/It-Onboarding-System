import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import styles from './PasswordFlow.module.css';

function ResetPassword() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Card title="Reset Password" subtitle="Use the forgot password page to reset your password with your email.">
        <div className={styles.stack}>
          <p className={styles.message}>
            The password reset flow is now handled directly on the forgot password page.
          </p>
          <Button onClick={() => navigate('/forgot-password')}>Go to Forgot Password</Button>
        </div>
        <div className={styles.footer}>
          <Link to="/login">Back to Login</Link>
        </div>
      </Card>
    </div>
  );
}

export default ResetPassword;
