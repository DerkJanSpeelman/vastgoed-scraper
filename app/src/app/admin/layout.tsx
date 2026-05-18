import { NavLink } from './NavLink';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Admin</div>
        <nav className={styles.nav}>
          <NavLink href="/admin/agencies">Makelaars</NavLink>
          <NavLink href="/admin/scrapers">Scraper runs</NavLink>
        </nav>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
