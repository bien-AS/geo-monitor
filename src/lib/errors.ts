export const USER_FRIENDLY_ERRORS = {
  NETWORK_ERROR: "Unable to connect. Please check your internet.",
  UNAUTHORIZED: "Session expired. Please log in again.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Something went wrong. Our team has been notified.",
  NOT_FOUND: "Resource not found.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
} as const;

export type UserFriendlyErrorCode = keyof typeof USER_FRIENDLY_ERRORS;

export type UserFriendlyError = {
  code: UserFriendlyErrorCode;
  message: string;
  context?: Record<string, unknown>;
};
