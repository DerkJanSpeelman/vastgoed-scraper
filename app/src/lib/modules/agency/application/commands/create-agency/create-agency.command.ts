import { DataSource } from "@/lib/modules/agency/domain/agency.entity";

export class CreateAgencyCommand {
  constructor(
    readonly name: string,
    readonly websiteUrl: string | null,
    readonly dataSource: DataSource,
  ) {}
}
