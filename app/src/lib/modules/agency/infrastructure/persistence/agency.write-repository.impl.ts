import { sql } from "@/db/client";
import { Agency } from "../../domain/agency.entity";
import { AgencyWriteRepository } from "../../domain/repositories/agency.write-repository.interface";

export class AgencyWriteRepositoryImpl implements AgencyWriteRepository {
  async save(agency: Agency): Promise<number> {
    const rows = await sql<{ id: number }[]>`
      INSERT INTO agencies (name, website_url, data_source, is_demo)
      VALUES (${agency.name}, ${agency.websiteUrl}, ${agency.dataSource}, false)
      RETURNING id
    `;
    return rows[0].id;
  }

  async update(agency: Agency): Promise<void> {
    await sql`
      UPDATE agencies SET
        name        = ${agency.name},
        website_url = ${agency.websiteUrl},
        data_source = ${agency.dataSource},
        updated_at  = NOW()
      WHERE id = ${agency.id}
    `;
  }

  async delete(id: number): Promise<void> {
    await sql`DELETE FROM agencies WHERE id = ${id}`;
  }

  async listingCount(id: number): Promise<number> {
    const rows = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM listings WHERE agency_id = ${id}
    `;
    return parseInt(rows[0].count, 10);
  }
}
