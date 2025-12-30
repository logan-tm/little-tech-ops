import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema";

const db = drizzle(process.env.DB_FILE_NAME!);

export default class UsersController {
  static async getUserById(userId: number) {
    return await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1)
      .get();
  }

  static async createUser(input: typeof usersTable.$inferInsert) {
    await db.insert(usersTable).values(input);
    return { message: "User created successfully" };
  }
}
