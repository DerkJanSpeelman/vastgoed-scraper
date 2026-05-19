export interface GetScraperConfigsDto {
  id:          number;
  agencyId:    number;
  type:        string;
  status:      string;
  uriPath:     string | null;
  config:      Record<string, unknown>;
  lastRunAt:   string | null;
  createdAt:   string;
  updatedAt:   string;
  websiteUrl:  string | null;
}
