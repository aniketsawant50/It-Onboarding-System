import styles from './Button.module.css';

function Button({ children, variant = 'primary', type = 'button', ...props }) {
  return (
    <button type={type} className={`${styles.button} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
