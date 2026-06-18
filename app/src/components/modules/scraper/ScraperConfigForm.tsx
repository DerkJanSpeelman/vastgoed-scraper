'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import type { EvaluateRequest } from './ProxyIframe';
import Link from 'next/link';
import { Input } from '@/components/ui/input/Input';
import { Textarea } from '@/components/ui/textarea/Textarea';
import { Button } from '@/components/ui/button/Button';
import type { GetScraperConfigsDto } from '@/lib/modules/scraper/application/queries/get-scraper-configs/get-scraper-configs.dto';
import { upsertScraperConfigAction, ScraperConfigActionState } from '@/app/admin/agencies/[id]/scrapers/[type]/actions';
import styles from './ScraperConfigForm.module.css';

const DETAIL_FIELDS: { key: string; label: string; multiline?: boolean; skipPreview?: boolean; imagePreview?: boolean }[] = [
  { key: 'title',        label: 'Titel' },
  { key: 'price',        label: 'Prijs' },
  { key: 'address',      label: 'Adres' },
  { key: 'postal_code',  label: 'Postcode' },
  { key: 'city',         label: 'Stad' },
  { key: 'area_m2',      label: 'Oppervlakte' },
  { key: 'rooms',        label: 'Kamers' },
  { key: 'bedrooms',     label: 'Slaapkamers' },
  { key: 'description',  label: 'Omschrijving', multiline: true },
  { key: 'images',       label: 'Afbeeldingen',  imagePreview: true },
  { key: 'floor_plans',  label: 'Plattegronden', imagePreview: true },
  { key: 'status',       label: 'Status' },
  { key: 'energy_label', label: 'Energielabel' },
  { key: 'year_built',   label: 'Bouwjaar' },
  { key: 'listing_type', label: 'Type object' },
];

const FETCH_TYPES = [
  { value: 'html', label: 'HTML scraping' },
  { value: 'json', label: 'JSON / XML API' },
];

const OVERVIEW_SELECTORS = [
  { key: 'listing_container' as const, label: 'Listing item selector',              hint: 'Selecteer het herhalende element — één XPath per listing (bijv. //ul/li, //article)', attribute: 'outerHTML' },
  { key: 'detail_link' as const,       label: 'Detail link selector',               hint: 'Gebruik /@href aan het einde om het href-attribuut te extraheren, bijv. //a[...]/@href', attribute: 'text' },
  { key: 'total_count' as const,       label: 'Totaal aantal selector (optioneel)', hint: undefined,                                                                             attribute: 'text' },
];

const ERROR_VALUES = new Set(['Geen overeenkomst', 'Geen match', 'Ongeldige regex']);

interface SharedProps {
  agencyId: number;
  agencyDomain: string | null;
  activeTargetField: string | null;
  onTargetRequest: (fieldKey: string) => void;
  injectedFieldValues?: Record<string, string>;
  onEvaluateSelectors?: (requests: EvaluateRequest[]) => void;
  selectorResults?: Record<string, { values: string[]; count: number }>;
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

function applyRegex(value: string, pattern: string): string {
  if (!pattern.trim()) return value;
  try {
    const m = value.match(new RegExp(pattern));
    if (!m) return 'Geen match';
    return m[1] ?? m[0];
  } catch {
    return 'Ongeldige regex';
  }
}

function ImagePreviewGrid({ urls, count }: { urls: string[]; count: number }) {
  const showMore = count > 5;
  const thumbUrls = urls.slice(0, 5);
  if (thumbUrls.length === 0) return null;
  return (
    <div className={styles.imagePreviewGrid}>
      {thumbUrls.map((url, i) => {
        const isLast = i === 4 && showMore;
        return (
          <div key={i} className={styles.imagePreviewThumb} style={{ backgroundImage: `url(${url})` }}>
            {isLast && <div className={styles.imagePreviewOverlay}>+{count - 4} foto's</div>}
          </div>
        );
      })}
    </div>
  );
}

export function ScraperConfigForm(props: Props) {
  const { agencyId, agencyDomain, activeTargetField, onTargetRequest, existing,
    injectedFieldValues, onEvaluateSelectors, selectorResults, onUriPathChange, onExampleUrlChange } = props;

  function resultText(fieldKey: string): string {
    const r = selectorResults?.[fieldKey];
    if (!r) return '';
    if (r.count === 0) return 'Geen overeenkomst';
    const lines = r.values.filter(v => v);
    const header = `${r.count} ${r.count === 1 ? 'resultaat' : 'resultaten'}`;
    const suffix = r.count > r.values.length ? `\n… (${r.count} totaal)` : '';
    return `${header}\n${lines.join('\n')}${suffix}`;
  }

  function resultTextSingle(fieldKey: string, regex: string): string {
    const r = selectorResults?.[fieldKey];
    if (!r) return '';
    if (r.count === 0) return 'Geen overeenkomst';
    const raw = (r.values[0] ?? '').trim();
    return applyRegex(raw, regex);
  }

  const domain = domainFromUrl(agencyDomain);

  const [state, formAction, isPending] = useActionState<ScraperConfigActionState | null, FormData>(
    upsertScraperConfigAction, null,
  );

  const [paginationTemplate, setPaginationTemplate] = useState<string>(
    cfg(existing, 'pagination_url_template', ''),
  );
  const [fetchType, setFetchType] = useState<string>(cfg(existing, 'fetch_type', 'html'));

  const [selectorValues, setSelectorValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const key of ['detail_link', 'listing_container', 'total_count']) {
      init[`${key}_selector`] = cfg(existing, `${key}_selector`, '');
    }
    for (const field of DETAIL_FIELDS) {
      init[`field_${field.key}_selector`] = fieldCfg(existing, field.key, 'selector', '');
    }
    return init;
  });

  const [regexValues, setRegexValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const { key } of OVERVIEW_SELECTORS) {
      init[key] = cfg(existing, `${key}_regex`, '');
    }
    for (const field of DETAIL_FIELDS) {
      init[field.key] = fieldCfg(existing, field.key, 'regex', '');
    }
    return init;
  });

  useEffect(() => {
    if (!injectedFieldValues || Object.keys(injectedFieldValues).length === 0) return;
    setSelectorValues(prev => ({ ...prev, ...injectedFieldValues }));
  }, [injectedFieldValues]);

  const evaluateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!onEvaluateSelectors) return;
    if (evaluateTimer.current) clearTimeout(evaluateTimer.current);
    evaluateTimer.current = setTimeout(() => {
      const requests: EvaluateRequest[] = [];
      const listingScope = selectorValues['listing_container_selector']?.trim();
      for (const { key, attribute } of OVERVIEW_SELECTORS) {
        const selector = selectorValues[`${key}_selector`]?.trim();
        if (!selector) continue;
        const scopeSelector = key === 'detail_link' && listingScope ? listingScope : undefined;
        requests.push({ fieldKey: `${key}_selector`, selector, selectorType: 'xpath', attribute, scopeSelector });
      }
      for (const field of DETAIL_FIELDS) {
        const selector = selectorValues[`field_${field.key}_selector`]?.trim();
        if (selector) requests.push({ fieldKey: `field_${field.key}_selector`, selector, selectorType: 'xpath', attribute: 'text' });
      }
      if (requests.length) onEvaluateSelectors(requests);
    }, 600);
    return () => { if (evaluateTimer.current) clearTimeout(evaluateTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectorValues]);

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

            <Input
              label="URI pad"
              name="uri_path"
              placeholder="/aanbod"
              before={domain || undefined}
              defaultValue={injectedFieldValues?.['uri_path'] ?? existing?.uriPath ?? ''}
              onChange={e => onUriPathChange?.((e.target as HTMLInputElement).value)}
            />

            <Input
              label="Paginering URL-patroon (optioneel)"
              name="pagination_url_template"
              placeholder="/aanbod?page={page}"
              hint="Gebruik {page} voor het paginanummer. Leeg laten als er geen paginering is."
              before={domain || undefined}
              value={paginationTemplate}
              onChange={e => setPaginationTemplate((e.target as HTMLInputElement).value)}
            />
          </div>

          {fetchType === 'json' && (
            <div className={styles.section}>
              <Input
                label="JSON pad naar listings"
                name="json_listings_path"
                placeholder="$.data.listings"
                defaultValue={cfg(existing, 'json_listings_path', '')}
              />
            </div>
          )}

          {fetchType === 'html' && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Selectors</div>

              {OVERVIEW_SELECTORS.map(({ key, label, hint }) => {
                const fieldKey = `${key}_selector`;
                const regex = regexValues[key] ?? '';
                const result = resultText(fieldKey);
                return (
                  <div key={key} className={styles.selectorField}>
                    <label className={styles.selectorLabel} htmlFor={fieldKey}>{label}</label>
                    {hint && <span className={styles.selectorHint}>{hint}</span>}
                    <div className={styles.overviewFieldRow}>
                      <div className={styles.selectorCell}>
                        <Input
                          id={fieldKey}
                          name={fieldKey}
                          placeholder='//div[contains(@class, "listing")]'
                          value={selectorValues[fieldKey] ?? ''}
                          onChange={e => setSelectorValues(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                          className={styles.monoInput}
                        />
                        <Input
                          id={`${key}_regex`}
                          name={`${key}_regex`}
                          placeholder="regex (optioneel)"
                          value={regex}
                          onChange={e => setRegexValues(prev => ({ ...prev, [key]: e.target.value }))}
                          className={styles.monoInput}
                        />
                        <Textarea
                          id={`${key}_result`}
                          disabled
                          value={ERROR_VALUES.has(result) ? '' : result}
                          placeholder="Gevonden waarde"
                          rows={Math.min(Math.max((result.match(/\n/g) ?? []).length + 1, 2), 8)}
                          readOnly
                          error={ERROR_VALUES.has(result) ? result : undefined}
                        />
                      </div>
                      <button
                        type="button"
                        className={`${styles.targetBtn}${activeTargetField === fieldKey ? ` ${styles.targetBtnActive}` : ''}`}
                        onClick={() => onTargetRequest(fieldKey)}
                      >
                        Kies
                      </button>
                    </div>
                    <input type="hidden" name={`${key}_selector_type`} value="xpath" />
                  </div>
                );
              })}
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
              placeholder="/aanbod/kerkstraat-12-amsterdam"
              hint="Alleen het pad — gebruikt voor de live preview bij het configureren van de veld-mapping."
              before={domain || undefined}
              defaultValue={cfg(existing, 'example_url', '')}
              onChange={e => onExampleUrlChange?.((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Veld-mapping</div>
            <div className={styles.fieldGrid}>
              {DETAIL_FIELDS.map(field => {
                const fieldKey = `field_${field.key}_selector`;
                const regex = regexValues[field.key] ?? '';
                const result = resultTextSingle(fieldKey, regex);
                return (
                  <div key={field.key} className={styles.selectorField}>
                    <label className={styles.selectorLabel} htmlFor={fieldKey}>{field.label}</label>
                    <div className={styles.overviewFieldRow}>
                      <div className={styles.selectorCell}>
                        <Input
                          id={fieldKey}
                          name={fieldKey}
                          placeholder='//span[contains(@class, "price")]'
                          value={selectorValues[fieldKey] ?? ''}
                          onChange={e => setSelectorValues(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                          className={styles.monoInput}
                        />
                        <Input
                          id={`field_${field.key}_regex`}
                          name={`field_${field.key}_regex`}
                          placeholder="regex (optioneel)"
                          value={regex}
                          onChange={e => setRegexValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className={styles.monoInput}
                        />
                        {field.imagePreview ? (
                          <ImagePreviewGrid
                            urls={selectorResults?.[fieldKey]?.values ?? []}
                            count={selectorResults?.[fieldKey]?.count ?? 0}
                          />
                        ) : !field.skipPreview && (
                          field.multiline ? (
                            <Textarea
                              id={`${fieldKey}_result`}
                              disabled
                              value={ERROR_VALUES.has(result) ? '' : result}
                              placeholder="Gevonden waarde"
                              rows={3}
                              readOnly
                              error={ERROR_VALUES.has(result) ? result : undefined}
                            />
                          ) : (
                            <Input
                              id={`${fieldKey}_result`}
                              disabled
                              value={ERROR_VALUES.has(result) ? '' : result}
                              placeholder="Gevonden waarde"
                              readOnly
                              error={ERROR_VALUES.has(result) ? result : undefined}
                            />
                          )
                        )}
                      </div>
                      <button
                        type="button"
                        className={`${styles.targetBtn}${activeTargetField === fieldKey ? ` ${styles.targetBtnActive}` : ''}`}
                        onClick={() => onTargetRequest(fieldKey)}
                      >
                        Kies
                      </button>
                    </div>
                    <input type="hidden" name={`field_${field.key}_attribute`} value="text" />
                    <input type="hidden" name={`field_${field.key}_selector_type`} value="xpath" />
                  </div>
                );
              })}
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
