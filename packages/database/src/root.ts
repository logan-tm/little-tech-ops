import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase, PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { Sql } from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export { schema };

export async function createDatabaseClient(url: string): Promise<Sql> {
  return postgres(url);
}

export function createDrizzle(client: Sql): DBType {
  return drizzle(client, { schema });
}

export type DBType = PostgresJsDatabase<typeof schema> & { $client: Sql };
export type TXType = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
export type DBTX = DBType | TXType;
