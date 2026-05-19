import { GetScraperConfigsDto } from "./get-scraper-configs.dto";
import { GetScraperConfigsRow } from "./get-scraper-configs.row";

export function toGetScraperConfigsDto(row: GetScraperConfigsRow): GetScraperConfigsDto {
  return {
    id:         row.id,
    agencyId:   row.agency_id,
    type:       row.type,
    status:     row.status,
    uriPath:    row.uri_path,
    config:     row.config,
    lastRunAt:  row.last_run_at?.toISOString() ?? null,
    createdAt:  row.created_at.toISOString(),
    updatedAt:  row.updated_at.toISOString(),
    websiteUrl: row.website_url ?? null,
  };
}
