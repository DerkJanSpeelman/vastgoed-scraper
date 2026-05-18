import { forwardRef, InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface BaseInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  before?: React.ReactNode;
  after?: React.ReactNode;
}

interface InputWithLabel extends BaseInputProps {
  label: string;
  id?: string;
}

interface InputWithoutLabel extends BaseInputProps {
  label?: never;
  id: string;
}

type InputProps = InputWithLabel | InputWithoutLabel;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, before, after, className, ...rest },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const hasAddon = before !== undefined || after !== undefined;
  const errorCls = error ? styles.hasError : '';

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      {hasAddon ? (
        <div className={[styles.addonWrapper, errorCls].filter(Boolean).join(' ')}>
          {before !== undefined && (
            <span className={styles.addon}>{before}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[styles.addonInput, className].filter(Boolean).join(' ')}
            {...rest}
          />
          {after !== undefined && (
            <span className={[styles.addon, styles.addonAfter].join(' ')}>{after}</span>
          )}
        </div>
      ) : (
        <input
          ref={ref}
          id={inputId}
          className={[styles.inputBase, errorCls, className].filter(Boolean).join(' ')}
          {...rest}
        />
      )}

      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
});
