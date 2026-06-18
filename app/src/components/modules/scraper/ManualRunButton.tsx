'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button/Button';
import styles from './ManualRunButton.module.css';

interface Props {
  agencyId: number;
  scraperConfigId: number;
  type: 'overview' | 'detail';
}

type State = 'idle' | 'loading' | 'queued' | 'error';

export function ManualRunButton({ agencyId, scraperConfigId, type }: Props) {
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const router = useRouter();

  async function handleClick() {
    setState('loading');
    try {
      const res = await fetch('/api/admin/scrapers/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId, scraperConfigId, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Er is iets misgegaan');
        setState('error');
      } else {
        setState('queued');
        router.refresh();
      }
    } catch {
      setErrorMsg('Kon de server niet bereiken');
      setState('error');
    }
  }

  return (
    <div className={styles.root}>
      <Button
        text={state === 'loading' ? 'Bezig…' : state === 'queued' ? 'In wachtrij' : 'Handmatig starten'}
        variant="secondary"
        size="sm"
        onClick={handleClick}
        disabled={state === 'loading' || state === 'queued'}
      />
      {state === 'error' && (
        <span className={styles.error} role="alert">{errorMsg}</span>
      )}
    </div>
  );
}
