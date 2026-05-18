import { ValidationError } from "@/lib/errors";

export type DataSource = "scraper" | "mailing_list" | "both";

const VALID_DATA_SOURCES: DataSource[] = ["scraper", "mailing_list", "both"];

export class Agency {
  private constructor(
    readonly id: number,
    readonly name: string,
    readonly websiteUrl: string | null,
    readonly isDemo: boolean,
    readonly dataSource: DataSource,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    name: string,
    websiteUrl: string | null,
    dataSource: DataSource,
  ): Agency {
    const trimmed = name.trim();
    if (!trimmed) throw new ValidationError("Naam is verplicht");
    if (trimmed.length > 200) throw new ValidationError("Naam mag maximaal 200 tekens zijn");
    if (!VALID_DATA_SOURCES.includes(dataSource)) throw new ValidationError("Ongeldige databron");
    return new Agency(0, trimmed, websiteUrl || null, false, dataSource, new Date(), new Date());
  }

  static existing(
    id: number,
    name: string,
    websiteUrl: string | null,
    isDemo: boolean,
    dataSource: DataSource,
    createdAt: Date,
    updatedAt: Date,
  ): Agency {
    return new Agency(id, name, websiteUrl, isDemo, dataSource, createdAt, updatedAt);
  }
}
