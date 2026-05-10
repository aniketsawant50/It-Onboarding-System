import Navbar from '../components/Layout/Navbar/Navbar';
import Sidebar from '../components/Layout/Sidebar/Sidebar';
import styles from './MainLayout.module.css';

function MainLayout({ links, title, stats, panels, children }) {
  return (
    <div className={styles.shell}>
      <Sidebar links={links} />
      <main className={styles.content}>
        <Navbar />
        <section className={styles.hero}>
          <div>
            <p className={styles.kicker}>Role Workspace</p>
            <h2>{title}</h2>
          </div>
        </section>
        {stats ? <section className={styles.stats}>{stats}</section> : null}
        {panels ? <section className={styles.panels}>{panels}</section> : null}
        {children ? <section className={styles.detail}>{children}</section> : null}
      </main>
    </div>
  );
}

export default MainLayout;
