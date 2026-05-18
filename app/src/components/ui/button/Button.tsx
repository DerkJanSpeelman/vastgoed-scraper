import Link from 'next/link';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
}

interface ButtonAsButton extends BaseButtonProps {
  href?: never;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  text: string;
}

interface ButtonAsLink extends BaseButtonProps {
  href: string;
  onClick?: never;
  type?: never;
  text: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  text,
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  href,
  onClick,
  type = 'button',
}: ButtonProps) {
  const cls = [
    styles.button,
    styles[variant],
    size !== 'md' ? styles[size] : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  if (href) {
    return (
      <Link href={href} className={cls}>
        {text}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {text}
    </button>
  );
}
