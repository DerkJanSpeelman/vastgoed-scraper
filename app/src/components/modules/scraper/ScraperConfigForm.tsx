'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import type { GetScraperConfigsDto } from '@/lib/modules/scraper/application/queries/get-scraper-configs/get-scraper-configs.dto';
import { upsertScraperConfigAction, ScraperConfigActionState } from '@/app/admin/agencies/[id]/scrapers/[type]/actions';
import styles from './ScraperConfigForm.module.css';

const DETAIL_FIELDS: { key: string; label: string; transforms?: string[] }[] = [
  { key: 'title',        label: 'Titel' },
  { key: 'price',        label: 'Prijs',        transforms: ['parse_price'] },
  { key: 'address',      label: 'Adres' },
  { key: 'city',         label: 'Stad' },
  { key: 'area_m2',      label: 'Oppervlakte',  transforms: ['parse_int'] },
  { key: 'rooms',        label: 'Kamers',        transforms: ['parse_int'] },
  { key: 'description',  label: 'Omschrijving' },
  { key: 'images',       label: 'Afbeeldingen' },
  { key: 'status',       label: 'Status' },
  { key: 'energy_label', label: 'Energielabel' },
  { key: 'year_built',   label: 'Bouwjaar',     transforms: ['parse_int'] },
  { key: 'listing_type', label: 'Type object' },
];

const PAGINATION_TYPES = [
  { value: 'none',          label: 'Geen paginering' },
  { value: 'query_param',   label: 'Query parameter (?pagina=2)' },
  { value: 'path_segment',  label: 'URL segment (/pagina/2)' },
  { value: 'load_more',     label: 'Laad meer knop (JS)' },
];

const FETCH_TYPES = [
  { value: 'html', label: 'HTML scraping' },
  { value: 'json', label: 'JSON / XML API' },
];

type SelectorType = 'css' | 'xpath';

interface SharedProps {
  agencyId: number;
  agencyDomain: string | null;
  activeTargetField: string | null;
  onTargetRequest: (fieldKey: string) => void;
  injectedFieldValues?: Record<string, string>;
  onUriPathChange?: (v: string) => void;
  onExampleUrlChange?: (v: string) => void;
}

interface OverviewProps extends SharedProps { type: 'overview'; existing: GetScraperConfigsDto | null; }
interface DetailProps extends SharedProps { type: 'detail'; existing: GetScraperConfigsDto | null; }

type Props = OverviewProps | DetailProps;

function domainFromUrl(url: string | null): string {
  if (!url) return '';
  try { return new URL(url).hostname; } catch { return url; }
}

function cfg<T>(existing: GetScraperConfigsDto | null, key: string, fallback: T): T {
  if (!existing?.config) return fallback;
  const v = (existing.config as Record<string, unknown>)[key];
  return v !== undefined ? (v as T) : fallback;
}

function fieldCfg(existing: GetScraperConfigsDto | null, field: string, key: string, fallback: string): string {
  if (!existing?.config) return fallback;
  const mappings = (existing.config as Record<string, unknown>).field_mappings as Record<string, Record<string, string>> | undefined;
  return mappings?.[field]?.[key] ?? fallback;
}

export function ScraperConfigForm(props: Props) {
  const { agencyId, agencyDomain, activeTargetField, onTargetRequest, existing,
    injectedFieldValues, onUriPathChange, onExampleUrlChange } = props;
  const domain = domainFromUrl(agencyDomain);

  const [state, formAction, isPending] = useActionState<ScraperConfigActionState | null, FormData>(
    upsertScraperConfigAction, null,
  );

  const [paginationType, setPaginationType] = useState<string>(
    cfg(existing, 'pagination_type', 'none'),
  );
  const [fetchType, setFetchType] = useState<string>(cfg(existing, 'fetch_type', 'html'));
  const [selectorTypes, setSelectorTypes] = useState<Record<string, SelectorType>>({});

  function selectorTypeFor(key: string, defaultVal: SelectorType = 'css'): SelectorType {
    return selectorTypes[key] ?? (cfg(existing, `${key}_selector_type`, defaultVal) as SelectorType);
  }

  function toggleSelectorType(key: string) {
    setSelectorTypes(prev => ({ ...prev, [key]: prev[key] === 'xpath' ? 'css' : 'xpath' }));
  }

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="agency_id" value={agencyId} />
      <input type="hidden" name="type" value={props.type} />

      {state?.error && <div className={styles.errorBanner} role="alert">{state.error}</div>}
      {state?.ok && <div className={styles.successBanner}>Configuratie opgeslagen</div>}

      {props.type === 'overview' && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Overzichtspagina</div>

            <Input
              label="URI pad"
              name="uri_path"
              placeholder="/aanbod"
              before={domain || undefined}
              defaultValue={injectedFieldValues?.['uri_path'] ?? existing?.uriPath ?? ''}
              onChange={e => onUriPathChange?.((e.target as HTMLInputElement).value)}
            />

            <div className={styles.rowFull}>
              <label className={styles.label} htmlFor="pagination_type">Paginering</label>
              <select
                id="pagination_type"
                name="pagination_type"
                className={styles.select}
                value={paginationType}
                onChange={e => setPaginationType(e.target.value)}
              >
                {PAGINATION_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {(paginationType === 'query_param' || paginationType === 'path_segment') && (
              <div className={styles.conditionalFields}>
                {paginationType === 'query_param' && (
                  <Input
                    label="Parameter naam"
                    name="page_param_name"
                    placeholder="pagina"
                    defaultValue={cfg(existing, 'page_param_name', '')}
                  />
                )}
                <Input
                  label="Startpagina nummer"
                  name="page_param_start"
                  type="number"
                  defaultValue={String(cfg(existing, 'page_param_start', 1))}
                />
              </div>
            )}

            <Input
              label="Listings per pagina"
              name="listings_per_page"
              type="number"
              defaultValue={String(cfg(existing, 'listings_per_page', 20))}
            />
            <Input
              label="Max pagina's"
              name="max_pages"
              type="number"
              defaultValue={String(cfg(existing, 'max_pages', 50))}
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Dataverzameling</div>

            <div className={styles.rowFull}>
              <label className={styles.label} htmlFor="fetch_type">Methode</label>
              <select
                id="fetch_type"
                name="fetch_type"
                className={styles.select}
                value={fetchType}
                onChange={e => setFetchType(e.target.value)}
              >
                {FETCH_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {fetchType === 'json' && (
              <Input
                label="JSON pad naar listings"
                name="json_listings_path"
                placeholder="$.data.listings"
                defaultValue={cfg(existing, 'json_listings_path', '')}
              />
            )}
          </div>

          {fetchType === 'html' && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Selectors</div>

              {(
                [
                  { key: 'detail_link', label: 'Detail link selector', attr: 'href' },
                  { key: 'listing_container', label: 'Listing container selector', attr: '' },
                  { key: 'total_count', label: 'Totaal aantal selector (optioneel)', attr: '' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className={styles.row}>
                  <Input
                    label={label}
                    name={`${key}_selector`}
                    placeholder={selectorTypeFor(key) === 'xpath' ? '//div[@class="listing"]' : '.listing a'}
                    defaultValue={cfg(existing, `${key}_selector`, '')}
                    after={
                      <button type="button" className={styles.targetBtn} onClick={() => onTargetRequest(`${key}_selector`)}>
                        Kies
                      </button>
                    }
                  />
                  <input type="hidden" name={`${key}_selector_type`} value={selectorTypeFor(key)} />
                  <button
                    type="button"
                    className={styles.targetBtn}
                    onClick={() => toggleSelectorType(key)}
                    title="Wissel tussen CSS en XPath"
                  >
                    {selectorTypeFor(key).toUpperCase()}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {props.type === 'detail' && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Detail pagina</div>

            <Input
              label="Voorbeeld URL"
              name="example_url"
              type="url"
              placeholder="https://www.makelaar.nl/aanbod/123-adres"
              defaultValue={cfg(existing, 'example_url', '')}
              onChange={e => onExampleUrlChange?.((e.target as HTMLInputElement).value)}
            />
            <Input
              label="URL patroon"
              name="url_pattern"
              placeholder="/aanbod/{slug}"
              hint="Gebruik {slug} of {id} voor het dynamische deel"
              defaultValue={cfg(existing, 'url_pattern', '')}
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Veld-mapping</div>
            <div className={styles.fieldGrid}>
              {DETAIL_FIELDS.map(field => (
                <div key={field.key} className={styles.fieldRow}>
                  <span className={styles.fieldName}>{field.label}</span>
                  <input
                    className={styles.fieldInput}
                    name={`field_${field.key}_selector`}
                    placeholder="selector"
                    defaultValue={fieldCfg(existing, field.key, 'selector', '')}
                    aria-label={`${field.label} selector`}
                  />
                  <button
                    type="button"
                    className={`${styles.targetBtn}${activeTargetField === `field_${field.key}_selector` ? ` ${styles.targetBtnActive}` : ''}`}
                    onClick={() => onTargetRequest(`field_${field.key}_selector`)}
                  >
                    Kies
                  </button>
                  <select
                    className={styles.fieldSelect}
                    name={`field_${field.key}_attribute`}
                    defaultValue={fieldCfg(existing, field.key, 'attribute', 'text')}
                    aria-label={`${field.label} attribuut`}
                  >
                    <option value="text">tekst</option>
                    <option value="href">href</option>
                    <option value="src">src</option>
                    <option value="data-value">data-value</option>
                  </select>
                  <input type="hidden" name={`field_${field.key}_selector_type`} value="css" />
                  {field.transforms && (
                    <select
                      className={styles.fieldSelect}
                      name={`field_${field.key}_transform`}
                      defaultValue={fieldCfg(existing, field.key, 'transform', '')}
                      aria-label={`${field.label} transformatie`}
                    >
                      <option value="">—</option>
                      {field.transforms.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className={styles.actions}>
        <Button type="submit" text={isPending ? 'Bezig…' : 'Opslaan'} disabled={isPending} />
        <Link href={`/admin/agencies/${agencyId}`} style={{ fontSize: '0.875rem', color: 'var(--ink-3)' }}>
          Annuleren
        </Link>
      </div>
    </form>
  );
}
