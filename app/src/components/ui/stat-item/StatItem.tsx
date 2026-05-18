import styles from "./StatItem.module.css";

interface StatItemProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  unit?: string;
  title?: string;
}

export function StatItem({ icon, value, unit, title }: StatItemProps) {
  const isPlaceholder = value === null || value === undefined || value === "";
  return (
    <span className={styles.item} title={title}>
      <span className={styles.icon}>{icon}</span>
      <span className={isPlaceholder ? styles.placeholder : styles.value}>
        {isPlaceholder ? "—" : value}
      </span>
      {unit && !isPlaceholder && <span className={styles.unit}>{unit}</span>}
    </span>
  );
}
