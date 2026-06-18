import { sql } from "@/db/client";
import { ScraperConfigReadRepository } from "../../application/queries/get-scraper-configs/get-scraper-configs.read-repository";
import { ScraperRunReadRepository } from "../../application/queries/get-scraper-runs/get-scraper-runs.read-repository";
import { GetScraperConfigsRow } from "../../application/queries/get-scraper-configs/get-scraper-configs.row";
import { GetScraperRunsRow } from "../../application/queries/get-scraper-runs/get-scraper-runs.row";

export class ScraperReadRepositoryImpl implements ScraperConfigReadRepository, ScraperRunReadRepository {
  async findByAgencyId(agencyId: number): Promise<GetScraperConfigsRow[]> {
    return sql<GetScraperConfigsRow[]>`
      SELECT id, agency_id, type, status, uri_path, config, last_run_at, created_at, updated_at
      FROM scraper_configs
      WHERE agency_id = ${agencyId}
      ORDER BY type
    `;
  }

  async findAll(agencyId?: number): Promise<GetScraperRunsRow[]> {
    if (agencyId !== undefined) {
      return sql<GetScraperRunsRow[]>`
        SELECT
          sr.id, sr.scraper_config_id, sr.agency_id,
          ag.name AS agency_name, sc.type AS config_type,
          sr.status, sr.triggered_by, sr.started_at, sr.finished_at,
          sr.listings_found, sr.listings_added, sr.listings_updated,
          sr.error_message, sr.error_details, sr.created_at
        FROM scraper_runs sr
        JOIN agencies ag ON ag.id = sr.agency_id
        JOIN scraper_configs sc ON sc.id = sr.scraper_config_id
        WHERE sr.agency_id = ${agencyId}
        ORDER BY sr.created_at DESC
        LIMIT 100
      `;
    }
    return sql<GetScraperRunsRow[]>`
      SELECT
        sr.id, sr.scraper_config_id, sr.agency_id,
        ag.name AS agency_name, sc.type AS config_type,
        sr.status, sr.triggered_by, sr.started_at, sr.finished_at,
        sr.listings_found, sr.listings_added, sr.listings_updated,
        sr.error_message, sr.error_details, sr.created_at
      FROM scraper_runs sr
      JOIN agencies ag ON ag.id = sr.agency_id
      JOIN scraper_configs sc ON sc.id = sr.scraper_config_id
      ORDER BY sr.created_at DESC
      LIMIT 100
    `;
  }

  async findById(id: number): Promise<GetScraperRunsRow | null> {
    const rows = await sql<GetScraperRunsRow[]>`
      SELECT
        sr.id, sr.scraper_config_id, sr.agency_id,
        ag.name AS agency_name, sc.type AS config_type,
        sr.status, sr.triggered_by, sr.started_at, sr.finished_at,
        sr.listings_found, sr.listings_added, sr.listings_updated,
        sr.error_message, sr.error_details, sr.created_at
      FROM scraper_runs sr
      JOIN agencies ag ON ag.id = sr.agency_id
      JOIN scraper_configs sc ON sc.id = sr.scraper_config_id
      WHERE sr.id = ${id}
    `;
    return rows[0] ?? null;
  }
}
