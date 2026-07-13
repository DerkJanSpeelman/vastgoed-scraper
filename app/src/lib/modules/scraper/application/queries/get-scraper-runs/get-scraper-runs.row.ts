export interface GetScraperRunsRow {
  id:                 number;
  scraper_config_id:  number;
  agency_id:          number;
  agency_name:        string;
  config_type:        string;
  status:             string;
  triggered_by:       string;
  started_at:         Date | null;
  finished_at:        Date | null;
  listings_found:     number | null;
  listings_added:     number | null;
  listings_updated:   number | null;
  error_message:      string | null;
  error_details:      Record<string, unknown> | null;
  created_at:         Date;
}
