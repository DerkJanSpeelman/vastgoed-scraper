import { DataSource } from "@/lib/modules/agency/domain/agency.entity";

export interface CreateAgencyDto {
  name: string;
  websiteUrl: string | null;
  dataSource: DataSource;
}
