export interface ScraperConfigTableRow {
  id:          number;
  agency_id:   number;
  type:        string;
  status:      string;
  uri_path:    string | null;
  config:      Record<string, unknown>;
  last_run_at: Date | null;
  created_at:  Date;
  updated_at:  Date;
}

export interface ScraperRunTableRow {
  id:                number;
  scraper_config_id: number;
  agency_id:         number;
  status:            string;
  triggered_by:      string;
  started_at:        Date | null;
  finished_at:       Date | null;
  listings_found:    number | null;
  listings_added:    number | null;
  listings_updated:  number | null;
  error_message:     string | null;
  error_details:     Record<string, unknown> | null;
  created_at:        Date;
}
