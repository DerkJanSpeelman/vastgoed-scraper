'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button/Button';
import { ActionState, deleteAgencyAction } from '../actions';
import styles from './page.module.css';

export function DeleteAgencyForm({ agencyId, listingCount }: { agencyId: number; listingCount: number }) {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(deleteAgencyAction, null);

  const hasListings = listingCount > 0;

  return (
    <div className={styles.deleteSection}>
      <h3 className={styles.deleteTitle}>Makelaar verwijderen</h3>
      <p className={styles.deleteHint}>
        {hasListings
          ? `Deze makelaar heeft ${listingCount} listing(s) gekoppeld en kan niet worden verwijderd.`
          : 'Dit kan niet ongedaan worden gemaakt.'}
      </p>
      {state?.error && (
        <p className={styles.deleteError}>{state.error}</p>
      )}
      <form action={formAction} className={styles.deleteActions}>
        <input type="hidden" name="id" value={agencyId} />
        <Button
          type="submit"
          text={isPending ? 'Bezig…' : 'Verwijder makelaar'}
          variant="destructive"
          disabled={isPending || hasListings}
        />
      </form>
    </div>
  );
}
