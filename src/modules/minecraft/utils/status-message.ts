import type { HttpClientResponse } from "effect/unstable/http";

export const statusMessage = (
  response: HttpClientResponse.HttpClientResponse
): string => `Official Minecraft API returned HTTP ${response.status}`;
