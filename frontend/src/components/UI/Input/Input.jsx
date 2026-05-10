import styles from './Input.module.css';

function Input({ label, error, ...props }) {
  return (
    <label className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <input className={styles.input} {...props} />
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}

export default Input;
