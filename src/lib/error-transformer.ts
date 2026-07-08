import { logger } from "@/lib/logger";
import type { UserFriendlyError, UserFriendlyErrorCode } from "@/lib/errors";
import { USER_FRIENDLY_ERRORS } from "@/lib/errors";

const STATUS_TO_CODE: Record<number, UserFriendlyErrorCode> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "UNAUTHORIZED",
  404: "NOT_FOUND",
  429: "RATE_LIMITED",
};

function mapStatusToCode(status: number): UserFriendlyErrorCode {
  const code = STATUS_TO_CODE[status];
  if (code) return code;
  if (status >= 500) return "SERVER_ERROR";
  return "SERVER_ERROR";
}

interface FetchErrorLike {
  status: number;
  message?: string;
}

function isFetchError(error: unknown): error is FetchErrorLike {
  return typeof error === "object" && error !== null && "status" in error;
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof Error && error.message === "Failed to fetch") return true;
  return false;
}

export function transformError(raw: unknown): UserFriendlyError {
  logger.error("Error captured", { error: raw, timestamp: Date.now() });

  if (isNetworkError(raw)) {
    return {
      code: "NETWORK_ERROR",
      message: USER_FRIENDLY_ERRORS.NETWORK_ERROR,
    };
  }

  if (isFetchError(raw)) {
    const code = mapStatusToCode(raw.status);
    return { code, message: USER_FRIENDLY_ERRORS[code] };
  }

  if (raw instanceof Error) {
    return {
      code: "SERVER_ERROR",
      message: USER_FRIENDLY_ERRORS.SERVER_ERROR,
      context: { name: raw.name },
    };
  }

  return {
    code: "SERVER_ERROR",
    message: USER_FRIENDLY_ERRORS.SERVER_ERROR,
  };
}
