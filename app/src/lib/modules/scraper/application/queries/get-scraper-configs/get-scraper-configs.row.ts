export interface GetScraperConfigsRow {
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
