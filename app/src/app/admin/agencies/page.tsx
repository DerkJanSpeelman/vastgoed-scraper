import { getAgenciesHandler } from '@/lib/modules/agency/agency.container';
import { Button } from '@/components/ui/button/Button';
import { AgenciesTable } from './AgenciesTable';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function AgenciesPage() {
  const agencies = await getAgenciesHandler.execute();

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Makelaars</h1>
        <Button text="Voeg makelaar toe" href="/admin/agencies/new" />
      </header>
      <AgenciesTable agencies={agencies} />
    </>
  );
}
