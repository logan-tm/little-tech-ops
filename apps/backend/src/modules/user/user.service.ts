import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { usersTable } from "../../db/schema";
import config from "../../lib/config";
import bcrypt from "bcryptjs";
import type { UnsafeUser, User, InputUser, UpdateableUser } from "./user.types";

const db = drizzle(config.DB_FILE_NAME);

const getSafeUser = (user: UnsafeUser): User => {
  // Remove any unsafe records from the user
  // i.e. any records not safe to store in an access token
  const { passwordHash, createdAt, updatedAt, ...safeUser } = user;
  return safeUser;
};

export const userService = {
  async getUserById(userId: number): Promise<User | null> {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1)
      .get();

    return user ? getSafeUser(user) : null;
  },
  async getUserByEmail(email: string): Promise<User | null> {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .get();

    return user ? getSafeUser(user) : null;
  },
  async createUser(input: InputUser) {
    const newUser = await db.insert(usersTable).values(input).returning().get();
    return getSafeUser(newUser);
  },

  async listUsers() {
    return (await db.select().from(usersTable)).map((user) =>
      getSafeUser(user)
    );
  },

  async deleteUser(userId: number) {
    return await db.delete(usersTable).where(eq(usersTable.id, userId));
  },

  async updateUser(id: number, user: UpdateableUser) {
    return await db.update(usersTable).set(user).where(eq(usersTable.id, id));
  },

  async checkLogin(
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
      user: getSafeUser(user),
    };
  },
};
