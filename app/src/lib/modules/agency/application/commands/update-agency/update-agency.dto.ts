import { DataSource } from "@/lib/modules/agency/domain/agency.entity";

export interface UpdateAgencyDto {
  id: number;
  name: string;
  websiteUrl: string | null;
  dataSource: DataSource;
}
