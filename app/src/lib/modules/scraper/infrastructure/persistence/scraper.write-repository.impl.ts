import { sql } from "@/db/client";
import { ScraperConfig } from "../../domain/scraper-config.entity";
import { ScraperRun } from "../../domain/scraper-run.entity";
import { ScraperConfigWriteRepository } from "../../domain/repositories/scraper-config.repository.interface";
import { ScraperRunWriteRepository } from "../../domain/repositories/scraper-run.repository.interface";

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
      INSERT INTO scraper_runs (scraper_config_id, agency_id, status, triggered_by)
      VALUES (${run.scraperConfigId}, ${run.agencyId}, ${run.status}, ${run.triggeredBy})
      RETURNING id
    `;
    return rows[0].id;
  }
}
