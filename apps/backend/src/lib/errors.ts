import { TRPCError } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

class CustomTrpcError {
  constructor(
    code: TRPC_ERROR_CODE_KEY,
    message: string,
    data?: Record<string, any>
  ) {
    return new TRPCError({
      code,
      message,
      cause: data,
    });
  }
}

export const InternalServerError = (message: string) =>
  new CustomTrpcError("INTERNAL_SERVER_ERROR", message);

export const UnauthorizedError = (message: string) =>
  new CustomTrpcError("UNAUTHORIZED", message);

export const ForbiddenError = (message: string) =>
  new CustomTrpcError("FORBIDDEN", message);
