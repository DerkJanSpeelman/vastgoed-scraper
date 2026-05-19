import { sql } from "@/db/client";
import { ScraperConfig } from "../../domain/scraper-config.entity";
import { ScraperRun } from "../../domain/scraper-run.entity";
import { ScraperConfigWriteRepository } from "../../domain/repositories/scraper-config.repository.interface";
import { ScraperRunWriteRepository, RunResultCounts } from "../../domain/repositories/scraper-run.repository.interface";

export class ScraperConfigWriteRepositoryImpl implements ScraperConfigWriteRepository {
  async save(config: ScraperConfig): Promise<number> {
    const rows = await sql<{ id: number }[]>`
      INSERT INTO scraper_configs (agency_id, type, status, uri_path, config)
      VALUES (${config.agencyId}, ${config.type}, ${config.status}, ${config.uriPath}, ${sql.json(config.config as Parameters<typeof sql.json>[0])})
      ON CONFLICT (agency_id, type) DO UPDATE SET
        status     = EXCLUDED.status,
        uri_path   = EXCLUDED.uri_path,
        config     = EXCLUDED.config,
        updated_at = NOW()
      RETURNING id
    `;
    return rows[0].id;
  }

}

export class ScraperRunWriteRepositoryImpl implements ScraperRunWriteRepository {
  async save(run: ScraperRun): Promise<number> {
    const rows = await sql<{ id: number }[]>`
      INSERT INTO scraper_runs (scraper_config_id, agency_id, status, triggered_by, input_uri)
      VALUES (${run.scraperConfigId}, ${run.agencyId}, ${run.status}, ${run.triggeredBy}, ${run.inputUri ?? null})
      RETURNING id
    `;
    return rows[0].id;
  }

  async updateToRunning(id: number): Promise<void> {
    await sql`
      UPDATE scraper_runs
      SET status = 'running', started_at = NOW()
      WHERE id = ${id}
    `;
  }

  async updateToSuccess(id: number, counts: RunResultCounts): Promise<void> {
    await sql`
      UPDATE scraper_runs
      SET status = 'success',
          finished_at = NOW(),
          listings_found = ${counts.listingsFound},
          listings_added = ${counts.listingsAdded},
          listings_updated = ${counts.listingsUpdated}
      WHERE id = ${id}
    `;
  }

  async updateToFailed(id: number, errorMessage: string, errorDetails: Record<string, unknown>): Promise<void> {
    await sql`
      UPDATE scraper_runs
      SET status = 'failed',
          finished_at = NOW(),
          error_message = ${errorMessage},
          error_details = ${sql.json(errorDetails as Parameters<typeof sql.json>[0])}
      WHERE id = ${id}
    `;
  }
}
