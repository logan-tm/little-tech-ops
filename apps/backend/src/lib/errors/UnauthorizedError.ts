import { TRPCError } from "@trpc/server";

export default class UnauthorizedError {
  constructor(message: string) {
    return new TRPCError({
      code: "UNAUTHORIZED",
      message,
    });
  }
}
