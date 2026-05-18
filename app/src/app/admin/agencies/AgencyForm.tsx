'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import { ActionState, createAgencyAction, updateAgencyAction } from './actions';
import styles from './AgencyForm.module.css';


interface AgencyFormProps {
  mode: 'create';
  defaultValues?: never;
  agencyId?: never;
}

interface AgencyEditFormProps {
  mode: 'edit';
  agencyId: number;
  defaultValues: {
    name: string;
    websiteUrl: string | null;
    dataSource: string;
  };
}

type Props = AgencyFormProps | AgencyEditFormProps;

const DATA_SOURCE_OPTIONS = [
  { value: 'scraper', label: 'Scraper' },
  { value: 'mailing_list', label: 'Mailinglijst' },
  { value: 'both', label: 'Beide' },
] as const;

export function AgencyForm(props: Props) {
  const action = props.mode === 'create' ? createAgencyAction : updateAgencyAction;
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(action, null);

  const defaults = props.mode === 'edit' ? props.defaultValues : { name: '', websiteUrl: '', dataSource: 'scraper' };

  return (
    <form action={formAction} className={styles.form}>
      {props.mode === 'edit' && (
        <input type="hidden" name="id" value={props.agencyId} />
      )}

      {state?.error && (
        <div className={styles.errorBanner} role="alert">{state.error}</div>
      )}
      {state?.ok && props.mode === 'edit' && (
        <div className={styles.successBanner}>Wijzigingen opgeslagen</div>
      )}

      <Input
        label="Naam"
        name="name"
        required
        placeholder="Bijv. Varwijnen & Sibma Makelaars"
        defaultValue={defaults.name}
        autoFocus={props.mode === 'create'}
      />

      <Input
        label="Website"
        name="website_url"
        type="url"
        placeholder="https://www.makelaar.nl"
        hint="Optioneel — inclusief https://"
        defaultValue={defaults.websiteUrl ?? ''}
      />

      <div className={styles.fieldGroup}>
        <div className={styles.radioLabel}>Databron</div>
        <div className={styles.radioGroup}>
          {DATA_SOURCE_OPTIONS.map((opt) => (
            <label key={opt.value} className={styles.radioOption}>
              <input
                type="radio"
                name="data_source"
                value={opt.value}
                defaultChecked={defaults.dataSource === opt.value}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" text={isPending ? 'Bezig…' : 'Opslaan'} disabled={isPending} />
        <Link href="/admin/agencies" style={{ fontSize: '0.875rem', color: 'var(--ink-3)' }}>
          Annuleren
        </Link>
      </div>
    </form>
  );
}
