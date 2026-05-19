import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db/client';
import { scraperContainer } from '@/lib/modules/scraper/scraper.container';
import { GetScraperConfigsQuery } from '@/lib/modules/scraper/application/queries/get-scraper-configs/get-scraper-configs.query';
import { AppError } from '@/lib/errors';
import { getBoss, SCRAPER_JOB } from '@/lib/queue/boss';

function validateInputUri(inputUri: string, websiteUrl: string | null): boolean {
  if (!websiteUrl) return false;
  try {
    const allowed = new URL(websiteUrl);
    const candidate = new URL(inputUri);
    return candidate.origin === allowed.origin;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 });
  }

  const { agencyId, type, inputUri } = body as Record<string, unknown>;

  if (typeof agencyId !== 'number' || !Number.isFinite(agencyId)) {
    return NextResponse.json({ error: 'Ongeldig agencyId' }, { status: 400 });
  }
  if (type !== 'overview' && type !== 'detail') {
    return NextResponse.json({ error: 'Ongeldig scraper type' }, { status: 400 });
  }
  const resolvedInputUri = typeof inputUri === 'string' && inputUri.trim() ? inputUri.trim() : null;

  try {
    const configs = await scraperContainer.getScraperConfigsHandler.execute(
      new GetScraperConfigsQuery(agencyId),
    );
    const config = configs.find(c => c.type === type);
    if (!config) {
      return NextResponse.json(
        { error: `Geen ${type} scraper configuratie gevonden voor deze makelaar` },
        { status: 404 },
      );
    }

    if (resolvedInputUri !== null && !validateInputUri(resolvedInputUri, config.websiteUrl)) {
      return NextResponse.json(
        { error: 'Ongeldige URI: moet overeenkomen met het domein van de makelaar' },
        { status: 400 },
      );
    }

    // Atomic deduplication: lock the scraper_config row for the duration of check+insert
    // so two concurrent requests cannot both pass the pending/running guard.
    let runId: number | null = null;
    await sql.begin(async (tx) => {
      await tx`SELECT id FROM scraper_configs WHERE id = ${config.id} FOR UPDATE`;

      const [{ pending }] = await tx<[{ pending: boolean }]>`
        SELECT EXISTS (
          SELECT 1 FROM scraper_runs
          WHERE scraper_config_id = ${config.id}
            AND status IN ('pending', 'running')
        ) AS pending
      `;
      if (pending) return;

      const [row] = await tx<[{ id: number }]>`
        INSERT INTO scraper_runs (scraper_config_id, agency_id, status, triggered_by, input_uri)
        VALUES (${config.id}, ${agencyId}, 'pending', 'manual', ${resolvedInputUri ?? null})
        RETURNING id
      `;
      runId = row.id;
    });

    if (runId === null) {
      return NextResponse.json(
        { error: 'Er staat al een run in de wachtrij of is bezig voor deze scraper' },
        { status: 409 },
      );
    }

    const boss = await getBoss();
    await boss.send(SCRAPER_JOB, { runId });

    return NextResponse.json({ id: runId }, { status: 201 });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    console.error('[POST /api/admin/scrapers/run] unexpected error', e);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}
