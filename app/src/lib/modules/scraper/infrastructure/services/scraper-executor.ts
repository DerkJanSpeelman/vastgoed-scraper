import { ScraperRunWriteRepository } from '../../domain/repositories/scraper-run.repository.interface';
import { ScraperRunReadRepository } from '../../application/queries/get-scraper-runs/get-scraper-runs.read-repository';
import { PlaywrightFetchService } from './playwright-fetch.service';
import { evaluateXPathAll, evaluateXPathFirst } from './selector-engine';
import { parsePrice, parseIntValue, applyRegex } from './transform-pipeline';
import { upsertListing, splitAddress, ScrapedListing } from '@/lib/modules/listing/infrastructure/persistence/listing-upsert.service';
import { RunContext } from '../../application/queries/get-scraper-runs/get-scraper-runs.read-repository';

interface OverviewConfig {
  listing_container_selector?: string;
  detail_link_selector?: string;
  detail_link_regex?: string;
  pagination_url_template?: string;
}

interface FieldMapping {
  selector?: string;
  attribute?: string;
  regex?: string;
  multiple?: boolean;
}

interface DetailConfig {
  example_url?: string;
  field_mappings?: Record<string, FieldMapping>;
}

const RANDOM_DELAY_MS = () => 1000 + Math.random() * 2000;
const MAX_PAGES = 200;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function resolvePropertyTypeId(raw: string | null): number {
  if (!raw) return 1;
  if (/nieuwbouw/i.test(raw)) return 2;
  return 1;
}

export class ScraperExecutor {
  constructor(
    private readonly runReadRepo: ScraperRunReadRepository,
    private readonly runWriteRepo: ScraperRunWriteRepository,
    private readonly fetcher: PlaywrightFetchService,
  ) {}

  async execute(runId: number): Promise<void> {
    const ctx = await this.runReadRepo.findRunContext(runId);
    if (!ctx) {
      console.error(`[ScraperExecutor] Run ${runId} not found`);
      return;
    }

    await this.runWriteRepo.updateToRunning(runId);

    try {
      if (ctx.configType === 'overview') {
        await this.runOverview(ctx);
      } else {
        await this.runDetail(ctx);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.runWriteRepo.updateToFailed(runId, msg, { stack: err instanceof Error ? err.stack : undefined });
    }
  }

  private async runOverview(ctx: RunContext): Promise<void> {
    const cfg = ctx.config as OverviewConfig;
    const baseUrl = ctx.agencyWebsiteUrl.replace(/\/$/, '');
    const startUrl = baseUrl + (ctx.uriPath ?? '');

    const detailUrls = new Set<string>();
    const pageErrors: { page: number; error: string }[] = [];
    let seenHashes = new Set<string>();

    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = page === 1
        ? startUrl
        : (cfg.pagination_url_template ?? '').replace('{page}', String(page)).replace('{base}', baseUrl);

      if (page > 1 && !cfg.pagination_url_template) break;

      let html: string;
      try {
        html = await this.fetcher.fetchHtml(url);
      } catch (err) {
        if (page === 1) throw err;
        pageErrors.push({ page, error: String(err) });
        break;
      }

      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(html))
        .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

      if (seenHashes.has(hash)) break;
      seenHashes.add(hash);

      const containerSel = cfg.listing_container_selector;
      const linkSel = cfg.detail_link_selector;

      if (!linkSel) break;

      const rawLinks = containerSel
        ? (() => {
            const containers = evaluateXPathAll(html, containerSel);
            return containers.flatMap(c => evaluateXPathAll(c, linkSel));
          })()
        : evaluateXPathAll(html, linkSel);

      if (rawLinks.length === 0) break;

      for (const raw of rawLinks) {
        const link = cfg.detail_link_regex ? applyRegex(raw, cfg.detail_link_regex) : raw;
        const fullUrl = link.startsWith('http') ? link : baseUrl + link;
        detailUrls.add(fullUrl);
      }

      await delay(RANDOM_DELAY_MS());
    }

    let found = detailUrls.size;
    let added = 0;
    let updated = 0;
    const detailErrors: { url: string; error: string }[] = [];

    for (const detailUrl of detailUrls) {
      try {
        const outcome = await this.scrapeDetailUrl(detailUrl, ctx);
        if (outcome === 'added') added++;
        else if (outcome === 'updated') updated++;
      } catch (err) {
        detailErrors.push({ url: detailUrl, error: String(err) });
      }
      await delay(RANDOM_DELAY_MS());
    }

    if (detailErrors.length > 0 || pageErrors.length > 0) {
      const errDetails: Record<string, unknown> = {};
      if (pageErrors.length > 0) errDetails.pageErrors = pageErrors;
      if (detailErrors.length > 0) errDetails.detailErrors = detailErrors;
      await this.runWriteRepo.updateToFailed(
        ctx.runId,
        `Completed with ${detailErrors.length} detail errors and ${pageErrors.length} page errors`,
        errDetails,
      );
    } else {
      await this.runWriteRepo.updateToSuccess(ctx.runId, {
        listingsFound: found,
        listingsAdded: added,
        listingsUpdated: updated,
      });
    }
  }

  private async runDetail(ctx: RunContext): Promise<void> {
    const baseUrl = ctx.agencyWebsiteUrl.replace(/\/$/, '');
    const uri = ctx.inputUri ?? ctx.uriPath ?? '';
    const url = uri.startsWith('http') ? uri : baseUrl + uri;

    const outcome = await this.scrapeDetailUrl(url, ctx);

    await this.runWriteRepo.updateToSuccess(ctx.runId, {
      listingsFound: 1,
      listingsAdded: outcome === 'added' ? 1 : 0,
      listingsUpdated: outcome === 'updated' ? 1 : 0,
    });
  }

  private async scrapeDetailUrl(url: string, ctx: RunContext): Promise<'added' | 'updated' | 'skipped'> {
    const html = await this.fetcher.fetchHtml(url);
    const cfg = ctx.config as DetailConfig;
    const fm = cfg.field_mappings ?? {};

    function extractFirst(field: string): string | null {
      const m = fm[field];
      if (!m?.selector) return null;
      const raw = evaluateXPathFirst(html, m.selector) ?? '';
      return m.regex ? applyRegex(raw, m.regex) : raw || null;
    }

    function extractAll(field: string): string[] {
      const m = fm[field];
      if (!m?.selector) return [];
      return evaluateXPathAll(html, m.selector);
    }

    const rawTitle = extractFirst('title') ?? extractFirst('address') ?? '';
    const { street, houseNumber } = splitAddress(rawTitle);
    const rawPrice = extractFirst('price');
    const rawCity = extractFirst('city') ?? '';
    const rawAreaM2 = extractFirst('area_m2');
    const rawBedrooms = extractFirst('bedrooms') ?? extractFirst('rooms');
    const rawListingType = extractFirst('listing_type');

    const priceVal = rawPrice ? parsePrice(rawPrice) : null;
    const areaVal = rawAreaM2 ? parseIntValue(rawAreaM2) : null;
    const bedroomsVal = rawBedrooms ? parseIntValue(rawBedrooms) : null;

    const listing: ScrapedListing = {
      sourceUrl: url,
      agencyId: ctx.agencyId,
      street,
      houseNumber,
      cityName: rawCity,
      price: priceVal,
      livingAreaM2: areaVal,
      bedrooms: bedroomsVal,
      description: extractFirst('description'),
      energyLabel: extractFirst('energy_label'),
      yearBuilt: (() => { const v = extractFirst('year_built'); return v ? parseIntValue(v) : null; })(),
      propertyTypeId: resolvePropertyTypeId(rawListingType),
      images: extractAll('images'),
      floorPlans: extractAll('floor_plans'),
    };

    return await upsertListing(listing);
  }
}
