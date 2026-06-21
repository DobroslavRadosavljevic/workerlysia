export const getErrorMessage = (cause: unknown): string =>
  cause instanceof Error ? cause.message : "Unknown error";
