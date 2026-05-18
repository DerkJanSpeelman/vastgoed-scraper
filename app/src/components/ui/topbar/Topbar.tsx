import Link from "next/link";
import styles from "./Topbar.module.css";

interface TopbarProps {
  listingCount?: number;
}

export function Topbar({ listingCount }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.dot} />
          Vastgoed Scraper
          {listingCount !== undefined && (
            <small className={styles.count}>{listingCount.toLocaleString("nl-NL")} woningen</small>
          )}
        </Link>
      </div>
    </header>
  );
}
