import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import {
  type InsertUserInput,
  type SelectUnsafeUserOutput,
  type UpdateUserInput,
  type User,
  usersTable,
} from "./schema";

import { db } from "../../db";

const getSafeUser = (user: SelectUnsafeUserOutput): User => {
  // Remove any unsafe records from the user
  // i.e. any records not safe to store in an access token
  const { password, createdAt, updatedAt, ...safeUser } = user;
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
  async createUser(input: InsertUserInput) {
    const hashedPassword = bcrypt.hashSync(input.password, 10);
    const newUser = await db
      .insert(usersTable)
      .values({
        ...input,
        password: hashedPassword,
      })
      .returning()
      .get();
    return getSafeUser(newUser);
  },

  async listUsers() {
    return (await db.select().from(usersTable)).map((user) =>
      getSafeUser(user),
    );
  },

  async deleteUser(userId: number) {
    return await db.delete(usersTable).where(eq(usersTable.id, userId));
  },

  async updateUser(id: number, user: UpdateUserInput) {
    return await db.update(usersTable).set(user).where(eq(usersTable.id, id));
  },

  async checkLogin(
    email: string,
    password: string,
  ): Promise<
    | {
        passwordCorrect: false;
        user: null;
      }
    | {
        passwordCorrect: true;
        user: User;
      }
  > {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .get();

    if (!user || bcrypt.compareSync(password, user.password)) {
      return {
        passwordCorrect: false,
        user: null,
      };
    }

    return {
      passwordCorrect: true,
      user: getSafeUser(user),
    };
  },
};
