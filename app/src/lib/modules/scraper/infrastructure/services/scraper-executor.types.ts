export interface RunContext {
  runId: number;
  agencyId: number;
  agencyWebsiteUrl: string;
  configType: 'overview' | 'detail';
  config: Record<string, unknown>;
  uriPath: string | null;
  inputUri: string | null;
}
