import styles from "./EnergyLabel.module.css";

interface EnergyLabelProps {
  label: string | null;
}

function normalizeLabel(label: string): string {
  return label.replace(/\+/g, "p");
}

export function EnergyLabel({ label }: EnergyLabelProps) {
  if (!label) {
    return <span className={`${styles.energy} ${styles.na}`}>—</span>;
  }
  const cls = normalizeLabel(label);
  return (
    <span className={`${styles.energy} ${styles[cls] ?? styles.na}`}>
      {label}
    </span>
  );
}
