export interface GetAgenciesRow {
  id: number;
  name: string;
  website_url: string | null;
  is_demo: boolean;
  data_source: string;
  listing_count: string;
  last_run_at: Date | null;
  overview_config_id: number | null;
  overview_status: string | null;
  detail_config_id: number | null;
  detail_status: string | null;
  created_at: Date;
}
