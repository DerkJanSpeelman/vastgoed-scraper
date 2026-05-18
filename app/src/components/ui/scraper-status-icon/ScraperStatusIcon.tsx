import styles from './ScraperStatusIcon.module.css';

type Status = 'unconfigured' | 'configured' | 'active' | 'paused' | 'error' | null;

interface ScraperStatusIconProps {
  status: Status;
}

const CONFIG: Record<NonNullable<Status>, { label: string; symbol: string; cls: string }> = {
  unconfigured: { label: 'Niet geconfigureerd', symbol: '?', cls: 'unconfigured' },
  configured:   { label: 'Geconfigureerd',      symbol: '⚙',  cls: 'configured' },
  active:       { label: 'Actief',              symbol: '●',  cls: 'active' },
  paused:       { label: 'Gepauzeerd',          symbol: '⏸', cls: 'paused' },
  error:        { label: 'Fout',               symbol: '●',  cls: 'error' },
};

export function ScraperStatusIcon({ status }: ScraperStatusIconProps) {
  if (status === null) {
    return (
      <span className={[styles.icon, styles.missing].join(' ')} title="Geen configuratie">
        ?
      </span>
    );
  }
  const { label, symbol, cls } = CONFIG[status];
  return (
    <span className={[styles.icon, styles[cls]].join(' ')} title={label}>
      {symbol}
    </span>
  );
}
