export interface GetScraperRunsDto {
  id:               number;
  scraperConfigId:  number;
  agencyId:         number;
  agencyName:       string;
  configType:       string;
  status:           string;
  triggeredBy:      string;
  startedAt:        string | null;
  finishedAt:       string | null;
  listingsFound:    number | null;
  listingsAdded:    number | null;
  listingsUpdated:  number | null;
  errorMessage:     string | null;
  errorDetails:     Record<string, unknown> | null;
  createdAt:        string;
}
