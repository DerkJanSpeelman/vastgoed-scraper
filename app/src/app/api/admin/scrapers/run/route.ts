import { NextRequest, NextResponse } from 'next/server';
import { scraperContainer } from '@/lib/modules/scraper/scraper.container';
import { GetScraperConfigsQuery } from '@/lib/modules/scraper/application/queries/get-scraper-configs/get-scraper-configs.query';
import { CreateScraperRunCommand } from '@/lib/modules/scraper/application/commands/create-scraper-run/create-scraper-run.command';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 });
  }

  const { agencyId, type } = body as Record<string, unknown>;

  if (typeof agencyId !== 'number' || !Number.isFinite(agencyId)) {
    return NextResponse.json({ error: 'Ongeldig agencyId' }, { status: 400 });
  }
  if (type !== 'overview' && type !== 'detail') {
    return NextResponse.json({ error: 'Ongeldig scraper type' }, { status: 400 });
  }

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

    const runId = await scraperContainer.createScraperRunHandler.execute(
      new CreateScraperRunCommand(config.id, agencyId, 'manual'),
    );

    return NextResponse.json({ id: runId }, { status: 201 });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    console.error('[POST /api/admin/scrapers/run] unexpected error', e);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}
