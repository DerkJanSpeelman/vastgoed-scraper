import { sql } from "@/db/client";
import { AgencyReadRepository } from "../../application/queries/get-agencies/get-agencies.read-repository";
import { GetAgenciesRow } from "../../application/queries/get-agencies/get-agencies.row";

export class AgencyReadRepositoryImpl implements AgencyReadRepository {
  async findAll(): Promise<GetAgenciesRow[]> {
    return sql<GetAgenciesRow[]>`
      SELECT
        a.id,
        a.name,
        a.website_url,
        a.is_demo,
        a.data_source,
        a.created_at,
        COUNT(DISTINCT l.id)::text AS listing_count,
        MAX(sr.created_at)        AS last_run_at,
        sc_ov.id                  AS overview_config_id,
        sc_ov.status              AS overview_status,
        sc_dt.id                  AS detail_config_id,
        sc_dt.status              AS detail_status
      FROM agencies a
      LEFT JOIN listings l
        ON l.agency_id = a.id
      LEFT JOIN scraper_configs sc_ov
        ON sc_ov.agency_id = a.id AND sc_ov.type = 'overview'
      LEFT JOIN scraper_configs sc_dt
        ON sc_dt.agency_id = a.id AND sc_dt.type = 'detail'
      LEFT JOIN scraper_runs sr
        ON sr.agency_id = a.id
      GROUP BY
        a.id, a.name, a.website_url, a.is_demo, a.data_source, a.created_at,
        sc_ov.id, sc_ov.status, sc_dt.id, sc_dt.status
      ORDER BY a.name
    `;
  }
}
