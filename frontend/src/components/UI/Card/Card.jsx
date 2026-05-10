import styles from './Card.module.css';

function Card({ title, subtitle, children }) {
  return (
    <section className={styles.card}>
      {(title || subtitle) && (
        <header className={styles.header}>
          {title ? <h3>{title}</h3> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      )}
      {children}
    </section>
  );
}

export default Card;
