import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

function Sidebar({ links }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span>ITS</span>
        <strong>Onboarding</strong>
      </div>
      <nav className={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            to={link.to}
          >
            <span>{link.label}</span>
            <small>{link.caption}</small>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
