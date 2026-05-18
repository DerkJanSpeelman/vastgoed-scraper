import { GetScraperRunsDto } from "./get-scraper-runs.dto";
import { GetScraperRunsRow } from "./get-scraper-runs.row";

export function toGetScraperRunsDto(row: GetScraperRunsRow): GetScraperRunsDto {
  return {
    id:              row.id,
    scraperConfigId: row.scraper_config_id,
    agencyId:        row.agency_id,
    agencyName:      row.agency_name,
    configType:      row.config_type,
    status:          row.status,
    triggeredBy:     row.triggered_by,
    startedAt:       row.started_at?.toISOString() ?? null,
    finishedAt:      row.finished_at?.toISOString() ?? null,
    listingsFound:   row.listings_found,
    listingsAdded:   row.listings_added,
    listingsUpdated: row.listings_updated,
    errorMessage:    row.error_message,
    errorDetails:    row.error_details,
    createdAt:       row.created_at.toISOString(),
  };
}
