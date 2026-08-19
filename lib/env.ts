/** Loose env shape so callers can inject a partial environment (tests, scripts). */
export type EnvLike = Record<string, string | undefined>;
