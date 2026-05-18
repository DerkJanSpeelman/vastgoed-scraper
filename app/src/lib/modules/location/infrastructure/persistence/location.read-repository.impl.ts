import { sql } from "@/db/client";
import { LocationReadRepository } from "../../application/queries/get-provinces/get-provinces.read-repository";
import { GetProvincesRow } from "../../application/queries/get-provinces/get-provinces.row";

export interface CityRow {
  id: number;
  name: string;
  municipality_id: number;
  municipality_name: string;
}

export interface MunicipalityRow {
  id: number;
  name: string;
  province_name: string;
}

export class LocationReadRepositoryImpl implements LocationReadRepository {
  async findAllProvinces(): Promise<GetProvincesRow[]> {
    return sql<GetProvincesRow[]>`
      SELECT id, name, code FROM provinces ORDER BY name
    `;
  }

  async findAllCities(): Promise<{ id: number; name: string; municipalityName: string; municipalityId: number }[]> {
    const rows = await sql<CityRow[]>`
      SELECT ci.id, ci.name, mu.id AS municipality_id, mu.name AS municipality_name
      FROM cities ci
      JOIN municipalities mu ON mu.id = ci.municipality_id
      ORDER BY ci.name
    `;
    return rows.map((r) => ({
      id:               r.id,
      name:             r.name,
      municipalityId:   r.municipality_id,
      municipalityName: r.municipality_name,
    }));
  }

  async findAllMunicipalities(): Promise<{ id: number; name: string; provinceName: string }[]> {
    const rows = await sql<MunicipalityRow[]>`
      SELECT mu.id, mu.name, pr.name AS province_name
      FROM municipalities mu
      JOIN provinces pr ON pr.id = mu.province_id
      ORDER BY mu.name
    `;
    return rows.map((r) => ({
      id:           r.id,
      name:         r.name,
      provinceName: r.province_name,
    }));
  }
}
