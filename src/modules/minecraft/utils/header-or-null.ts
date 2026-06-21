import { Option } from "effect";
import type { HttpClientResponse } from "effect/unstable/http";
import { Headers } from "effect/unstable/http";

export const headerOrNull = (
  response: HttpClientResponse.HttpClientResponse,
  key: string
): string | null => Option.getOrNull(Headers.get(response.headers, key));
