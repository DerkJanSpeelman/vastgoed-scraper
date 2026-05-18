import Link from 'next/link';
import { AgencyForm } from '../AgencyForm';

export default function NewAgencyPage() {
  return (
    <>
      <header style={{ marginBottom: 28 }}>
        <Link
          href="/admin/agencies"
          style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', textDecoration: 'none', display: 'block', marginBottom: 8 }}
        >
          ← Makelaars
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>
          Makelaar toevoegen
        </h1>
      </header>
      <AgencyForm mode="create" />
    </>
  );
}
