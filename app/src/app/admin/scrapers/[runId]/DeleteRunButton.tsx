'use client';

import { useTransition } from 'react';
import { deleteScraperRun } from '../actions';
import styles from './page.module.css';

export function DeleteRunButton({ runId }: { runId: number }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm('Run uit de wachtrij verwijderen?')) return;
    startTransition(() => { deleteScraperRun(runId); });
  }

  return (
    <button
      className={styles.deleteButton}
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? 'Verwijderen…' : 'Verwijder uit wachtrij'}
    </button>
  );
}
