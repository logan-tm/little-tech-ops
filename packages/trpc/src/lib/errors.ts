import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { TRPCError } from "@trpc/server";

class CustomTrpcError {
  constructor(
    code: TRPC_ERROR_CODE_KEY,
    message: string,
    data?: Record<string, any>,
  ) {
    return new TRPCError({
      code,
      message,
      cause: data,
    });
  }
}

export function InternalServerError(message: string) {
  return new CustomTrpcError("INTERNAL_SERVER_ERROR", message);
}

export function UnauthorizedError(message: string) {
  return new CustomTrpcError("UNAUTHORIZED", message);
}

export function ForbiddenError(message: string) {
  return new CustomTrpcError("FORBIDDEN", message);
}
