import { useAuth } from '../../../context/AuthContext';
import Button from '../../UI/Button/Button';
import styles from './Navbar.module.css';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className={styles.navbar}>
      <div>
        <p className={styles.eyebrow}>IT Operations</p>
        <h1>Onboarding Command Center</h1>
      </div>
      <div className={styles.actions}>
        <div>
          <strong>{user?.name || 'User'}</strong>
          <p>{user?.role}</p>
        </div>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default Navbar;
