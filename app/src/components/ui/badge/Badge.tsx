import styles from "./Badge.module.css";

interface BadgeProps {
  variant: "nieuwbouw" | "stille-verkoop";
}

export function Badge({ variant }: BadgeProps) {
  if (variant === "nieuwbouw") {
    return <span className={`${styles.badge} ${styles.nieuwbouw}`}>Nieuwbouw</span>;
  }
  return <span className={`${styles.badge} ${styles.stilleVerkoop}`}>Stille verkoop</span>;
}
