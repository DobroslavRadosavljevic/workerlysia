import { Clock, Context, Effect, Layer } from "effect";

import { RateLimitExceededError } from "../effect/errors/rate-limit-exceeded";
import { recoverEffect } from "../effect/runtime";
import { CloudflareKv } from "./cloudflare-kv";

const MIN_TTL = 60;

export interface RateLimitRequest {
  readonly key: string;
  readonly max: number;
  readonly window: number;
}

interface RateLimitState {
  readonly current: number;
  readonly key: string;
  readonly retryAfter: number;
}

export class RateLimitService extends Context.Service<
  RateLimitService,
  {
    readonly check: (
      request: RateLimitRequest
    ) => Effect.Effect<RateLimitState, RateLimitExceededError>;
  }
>()("RateLimitService") {}

const getRateLimitState = (
  key: string,
  max: number,
  window: number,
  currentStr: string | null,
  now: number
): Effect.Effect<RateLimitState, RateLimitExceededError> => {
  const windowStart = now - (now % window);
  const windowKey = `${key}:${windowStart}`;
  const parsed = currentStr ? Number.parseInt(currentStr, 10) : 0;
  const current = Number.isNaN(parsed) ? 0 : parsed;
  const retryAfter = windowStart + window - now;

  return current >= max
    ? Effect.fail(new RateLimitExceededError({ max, retryAfter }))
    : Effect.succeed({ current, key: windowKey, retryAfter });
};

export const RateLimitServiceLive = Layer.effect(
  RateLimitService,
  Effect.gen(function* makeRateLimitService() {
    const kv = yield* CloudflareKv;

    return RateLimitService.of({
      check: ({ key, max, window }) =>
        Effect.gen(function* checkRateLimit() {
          const nowMillis = yield* Clock.currentTimeMillis;
          const now = Math.floor(nowMillis / 1000);
          const windowStart = now - (now % window);
          const windowKey = `${key}:${windowStart}`;
          const currentStr = yield* kv
            .get(windowKey)
            .pipe(recoverEffect(() => Effect.succeed(null)));
          const state = yield* getRateLimitState(
            key,
            max,
            window,
            currentStr,
            now
          );

          yield* kv
            .put(state.key, String(state.current + 1), {
              expirationTtl: Math.max(MIN_TTL, window),
            })
            .pipe(recoverEffect(() => Effect.void));

          return state;
        }),
    });
  })
);
