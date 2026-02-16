import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import type { DBType } from "../../root";

import { usersTable } from "./schema";
import type { InsertUserInput, SelectUnsafeUserOutput, UpdateUserInput, User } from "./types";

function getSafeUser(user: SelectUnsafeUserOutput): User {
  // Remove any unsafe records from the user
  // i.e. any records not safe to store in an access token
  const { password, createdAt, updatedAt, ...safeUser } = user;
  return safeUser;
}

export class UserService {
  constructor(private db: DBType) {}
  async getUserById(userId: number): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    return user ? getSafeUser(user) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    return user ? getSafeUser(user) : null;
  }

  async createUser(input: InsertUserInput) {
    const hashedPassword = bcrypt.hashSync(input.password, 10);
    const [newUser] = await this.db
      .insert(usersTable)
      .values({
        ...input,
        password: hashedPassword,
      })
      .returning();
    return newUser ? getSafeUser(newUser) : null;
  }

  async listUsers() {
    return (await this.db.select().from(usersTable)).map(user =>
      getSafeUser(user),
    );
  }

  async deleteUser(userId: number) {
    return await this.db.delete(usersTable).where(eq(usersTable.id, userId));
  }

  async updateUser(id: number, user: UpdateUserInput) {
    return await this.db
      .update(usersTable)
      .set(user)
      .where(eq(usersTable.id, id));
  }

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
    const [user] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
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
  }
}
