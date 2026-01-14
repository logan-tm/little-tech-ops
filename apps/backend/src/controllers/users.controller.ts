import { drizzle } from "drizzle-orm/libsql";
import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { usersTable } from "../db/schema";
import config from "../lib/config";
import bcrypt from "bcryptjs";

const db = drizzle(config.DB_FILE_NAME);

type UnsafeUser = InferSelectModel<typeof usersTable>;
export type User = Omit<UnsafeUser, "passwordHash" | "createdAt" | "updatedAt">;
type InputUser = Omit<
  InferInsertModel<typeof usersTable>,
  "id" | "createdAt" | "updatedAt"
>;
type UpdateableUser = Partial<InputUser>;

export default class UsersController {
  private static getSafe(user: UnsafeUser): User {
    // Remove any unsafe records from the user
    // i.e. any records not safe to store in an access token
    const { passwordHash, createdAt, updatedAt, ...safeUser } = user;
    return safeUser;
  }

  static async getUserById(userId: number): Promise<User | null> {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1)
      .get();

    return user ? this.getSafe(user) : null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .get();

    return user ? this.getSafe(user) : null;
  }

  static async createUser(input: InputUser) {
    const newUser = await db.insert(usersTable).values(input).returning().get();
    return this.getSafe(newUser);
  }

  static async listUsers() {
    return (await db.select().from(usersTable)).map((user) =>
      this.getSafe(user)
    );
  }

  static async deleteUser(userId: number) {
    return await db.delete(usersTable).where(eq(usersTable.id, userId));
  }

  static async updateUser(id: number, user: UpdateableUser) {
    return await db.update(usersTable).set(user).where(eq(usersTable.id, id));
  }

  static async checkLogin(
    email: string,
    password: string
  ): Promise<
    | {
        passwordCorrect: false;
        user: null;
      }
    | {
        passwordCorrect: boolean;
        user: User;
      }
  > {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .get();

    if (!user) {
      return {
        passwordCorrect: false,
        user: null,
      };
    }

    return {
      passwordCorrect: bcrypt.compareSync(password, user.passwordHash),
      user: this.getSafe(user),
    };
  }
}
