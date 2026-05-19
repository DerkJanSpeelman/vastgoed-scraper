import { ScraperRun } from "../scraper-run.entity";

export interface RunResultCounts {
  listingsFound: number;
  listingsAdded: number;
  listingsUpdated: number;
}

export interface ScraperRunWriteRepository {
  save(run: ScraperRun): Promise<number>;
  updateToRunning(id: number): Promise<void>;
  updateToSuccess(id: number, counts: RunResultCounts): Promise<void>;
  updateToFailed(id: number, errorMessage: string, errorDetails: Record<string, unknown>): Promise<void>;
  /** Deletes the run only when status is 'pending'. Returns true if deleted. */
  deleteIfPending(id: number): Promise<boolean>;
}
