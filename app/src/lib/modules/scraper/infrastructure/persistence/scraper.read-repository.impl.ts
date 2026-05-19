import { sql } from "@/db/client";
import { ScraperConfigReadRepository } from "../../application/queries/get-scraper-configs/get-scraper-configs.read-repository";
import { ScraperRunReadRepository } from "../../application/queries/get-scraper-runs/get-scraper-runs.read-repository";
import { GetScraperConfigsRow } from "../../application/queries/get-scraper-configs/get-scraper-configs.row";
import { GetScraperRunsRow } from "../../application/queries/get-scraper-runs/get-scraper-runs.row";
import { RunContext } from "../../application/queries/get-scraper-runs/get-scraper-runs.read-repository";

export class ScraperReadRepositoryImpl implements ScraperConfigReadRepository, ScraperRunReadRepository {
  async findByAgencyId(agencyId: number): Promise<GetScraperConfigsRow[]> {
    return sql<GetScraperConfigsRow[]>`
      SELECT sc.id, sc.agency_id, sc.type, sc.status, sc.uri_path, sc.config,
             sc.last_run_at, sc.created_at, sc.updated_at, a.website_url
      FROM scraper_configs sc
      JOIN agencies a ON a.id = sc.agency_id
      WHERE sc.agency_id = ${agencyId}
      ORDER BY sc.type
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

  async findRunContext(runId: number): Promise<RunContext | null> {
    const rows = await sql<{
      run_id: number;
      agency_id: number;
      website_url: string | null;
      config_type: string;
      config: Record<string, unknown>;
      uri_path: string | null;
      input_uri: string | null;
    }[]>`
      SELECT
        sr.id AS run_id,
        sr.agency_id,
        a.website_url,
        sc.type AS config_type,
        sc.config,
        sc.uri_path,
        sr.input_uri
      FROM scraper_runs sr
      JOIN scraper_configs sc ON sc.id = sr.scraper_config_id
      JOIN agencies a ON a.id = sr.agency_id
      WHERE sr.id = ${runId}
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      runId: row.run_id,
      agencyId: row.agency_id,
      agencyWebsiteUrl: row.website_url ?? '',
      configType: row.config_type as 'overview' | 'detail',
      config: row.config,
      uriPath: row.uri_path,
      inputUri: row.input_uri,
    };
  }

  async hasPendingOrRunning(scraperConfigId: number): Promise<boolean> {
    const rows = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM scraper_runs
        WHERE scraper_config_id = ${scraperConfigId}
          AND status IN ('pending', 'running')
      ) AS exists
    `;
    return rows[0]?.exists ?? false;
  }
}
