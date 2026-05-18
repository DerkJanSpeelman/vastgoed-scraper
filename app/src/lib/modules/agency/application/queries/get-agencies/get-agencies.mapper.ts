import { GetAgenciesDto, DataSource, ScraperConfigStatus } from "./get-agencies.dto";
import { GetAgenciesRow } from "./get-agencies.row";

export function toGetAgenciesDto(row: GetAgenciesRow): GetAgenciesDto {
  return {
    id: row.id,
    name: row.name,
    websiteUrl: row.website_url,
    isDemo: row.is_demo,
    dataSource: row.data_source as DataSource,
    listingCount: parseInt(row.listing_count, 10),
    lastRunAt: row.last_run_at ? row.last_run_at.toISOString() : null,
    overviewConfigId: row.overview_config_id,
    overviewStatus: row.overview_status as ScraperConfigStatus | null,
    detailConfigId: row.detail_config_id,
    detailStatus: row.detail_status as ScraperConfigStatus | null,
    createdAt: row.created_at.toISOString(),
  };
}
