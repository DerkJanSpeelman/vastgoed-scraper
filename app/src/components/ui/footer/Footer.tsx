import styles from "./Footer.module.css";

interface FooterProps {
  agencyCount?: number;
}

export function Footer({ agencyCount }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <span>Vastgoed Scraper · intern dashboard · niet voor distributie</span>
      <span>
        scraping interval · 15 min
        {agencyCount !== undefined ? ` · ${agencyCount} actieve bronnen` : ""}
      </span>
    </footer>
  );
}
