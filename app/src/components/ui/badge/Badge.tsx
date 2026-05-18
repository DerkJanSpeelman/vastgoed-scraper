import styles from "./Badge.module.css";

interface BadgeProps {
  variant: "nieuwbouw" | "stille-verkoop" | "demo";
}

const LABELS: Record<BadgeProps["variant"], string> = {
  "nieuwbouw": "Nieuwbouw",
  "stille-verkoop": "Stille verkoop",
  "demo": "Demo",
};

const STYLE_MAP: Record<BadgeProps["variant"], string> = {
  "nieuwbouw": styles.nieuwbouw,
  "stille-verkoop": styles.stilleVerkoop,
  "demo": styles.demo,
};

export function Badge({ variant }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${STYLE_MAP[variant]}`}>
      {LABELS[variant]}
    </span>
  );
}
