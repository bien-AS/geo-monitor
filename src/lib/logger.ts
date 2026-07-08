const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

function getLevel(): LogLevel {
  const env = process.env.NEXT_PUBLIC_LOG_LEVEL;
  if (env && env in LOG_LEVELS) return env as LogLevel;
  return "warn";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getLevel()];
}

export const logger = {
  debug(message: string, context?: unknown) {
    if (shouldLog("debug")) console.debug("[as-baptist-local]", message, context ?? "");
  },
  info(message: string, context?: unknown) {
    if (shouldLog("info")) console.info("[as-baptist-local]", message, context ?? "");
  },
  warn(message: string, context?: unknown) {
    if (shouldLog("warn")) console.warn("[as-baptist-local]", message, context ?? "");
  },
  error(message: string, context?: unknown) {
    if (shouldLog("error")) console.error("[as-baptist-local]", message, context ?? "");
  },
};
