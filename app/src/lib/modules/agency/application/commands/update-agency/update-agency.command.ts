import { DataSource } from "@/lib/modules/agency/domain/agency.entity";

export class UpdateAgencyCommand {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly websiteUrl: string | null,
    readonly dataSource: DataSource,
  ) {}
}
