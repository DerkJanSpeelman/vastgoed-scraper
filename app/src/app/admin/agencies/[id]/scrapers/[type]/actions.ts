'use server';

import { revalidatePath } from 'next/cache';
import { AppError } from '@/lib/errors';
import { scraperContainer } from '@/lib/modules/scraper/scraper.container';
import { UpsertScraperConfigCommand } from '@/lib/modules/scraper/application/commands/upsert-scraper-config/upsert-scraper-config.command';

export interface ScraperConfigActionState {
  error?: string;
  ok?: boolean;
}

const DETAIL_FIELDS = [
  'title', 'price', 'address', 'city', 'area_m2', 'rooms',
  'description', 'images', 'status', 'energy_label', 'year_built', 'listing_type',
] as const;

type DetailField = (typeof DETAIL_FIELDS)[number];

function parseOverviewConfig(formData: FormData): Record<string, unknown> {
  return {
    pagination_type: formData.get('pagination_type') as string || 'none',
    page_param_name: formData.get('page_param_name') as string || null,
    page_param_start: parseInt(formData.get('page_param_start') as string, 10) || 1,
    listings_per_page: parseInt(formData.get('listings_per_page') as string, 10) || 20,
    detail_link_selector: formData.get('detail_link_selector') as string || null,
    detail_link_selector_type: formData.get('detail_link_selector_type') as string || 'css',
    detail_link_attribute: formData.get('detail_link_attribute') as string || 'href',
    listing_container_selector: formData.get('listing_container_selector') as string || null,
    listing_container_selector_type: formData.get('listing_container_selector_type') as string || 'css',
    total_count_selector: formData.get('total_count_selector') as string || null,
    total_count_selector_type: formData.get('total_count_selector_type') as string || 'css',
    fetch_type: formData.get('fetch_type') as string || 'html',
    json_listings_path: formData.get('json_listings_path') as string || null,
    max_pages: parseInt(formData.get('max_pages') as string, 10) || 50,
  };
}

function parseDetailConfig(formData: FormData): Record<string, unknown> {
  const fieldMappings: Record<string, unknown> = {};
  for (const field of DETAIL_FIELDS) {
    fieldMappings[field] = {
      selector: formData.get(`field_${field}_selector`) as string || null,
      selector_type: formData.get(`field_${field}_selector_type`) as string || 'css',
      attribute: formData.get(`field_${field}_attribute`) as string || 'text',
      transform: formData.get(`field_${field}_transform`) as string || null,
      multiple: field === 'images',
    };
  }
  return {
    example_url: formData.get('example_url') as string || null,
    url_pattern: formData.get('url_pattern') as string || null,
    field_mappings: fieldMappings,
  };
}

export async function upsertScraperConfigAction(
  _prev: ScraperConfigActionState | null,
  formData: FormData,
): Promise<ScraperConfigActionState> {
  const agencyId = parseInt(formData.get('agency_id') as string, 10);
  if (!Number.isFinite(agencyId)) return { error: 'Ongeldig makelaar id' };

  const rawType = formData.get('type') as string;
  if (rawType !== 'overview' && rawType !== 'detail') return { error: 'Ongeldig scraper type' };

  const uriPath = (formData.get('uri_path') as string) || null;
  const config = rawType === 'overview' ? parseOverviewConfig(formData) : parseDetailConfig(formData);

  try {
    await scraperContainer.upsertScraperConfigHandler.execute(
      new UpsertScraperConfigCommand(agencyId, rawType, uriPath, config),
    );
  } catch (e) {
    if (e instanceof AppError) return { error: e.message };
    console.error('[upsertScraperConfigAction] unexpected error', { agencyId, rawType }, e);
    return { error: 'Er is iets misgegaan. Probeer het opnieuw.' };
  }

  revalidatePath(`/admin/agencies/${agencyId}`);
  return { ok: true };
}
