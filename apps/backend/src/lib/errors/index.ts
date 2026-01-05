import { TRPCError } from "@trpc/server";

const TRPC_ERROR_CODES = [
  "BAD_REQUEST", // 400
  "UNAUTHORIZED", // 401
  "FORBIDDEN", // 403
  "NOT_FOUND", // 404
  "TIMEOUT", // 408
  "CONFLICT", // 409
  "PRECONDITION_FAILED", // 412
  "PAYLOAD_TOO_LARGE", // 413
  "METHOD_NOT_SUPPORTED", // 405
  "CLIENT_CLOSED_REQUEST", // 499
  "INTERNAL_SERVER_ERROR", // 500
] as const;
type TRPC_ERROR_CODE_TYPE = (typeof TRPC_ERROR_CODES)[number];

export default class CustomTrpcError {
  constructor(code: TRPC_ERROR_CODE_TYPE, message: string) {
    return new TRPCError({
      code,
      message,
    });
  }
}

export const InternalServerError = (message: string) =>
  new CustomTrpcError("INTERNAL_SERVER_ERROR", message);
