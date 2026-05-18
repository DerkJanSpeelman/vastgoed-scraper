import { AppError } from "@/lib/errors";

export class ScraperError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
  }
}

export class ScraperConfigNotFoundError extends ScraperError {
  constructor(id: number) {
    super(`Scraper config ${id} not found`, 404);
  }
}

export class ScraperRunNotFoundError extends ScraperError {
  constructor(id: number) {
    super(`Scraper run ${id} not found`, 404);
  }
}
