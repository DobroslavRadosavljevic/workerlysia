import { Context, DateTime, Effect, Layer } from "effect";

type CachedDemoText =
  | "This response is NOT cached"
  | "This response is cached"
  | "This response is cached for longer";

type RateLimitDemoText =
  | "This endpoint has no rate limit"
  | "This endpoint has strict rate limiting"
  | "This endpoint is rate limited";

export class DemoService extends Context.Service<
  DemoService,
  {
    readonly cached: (data: CachedDemoText) => Effect.Effect<{
      readonly data: CachedDemoText;
      readonly generatedAt: string;
      readonly random: number;
    }>;
    readonly rateLimited: (message: RateLimitDemoText) => Effect.Effect<{
      readonly message: RateLimitDemoText;
      readonly timestamp: string;
    }>;
  }
>()("DemoService") {}

export const DemoServiceLive = Layer.succeed(DemoService, {
  cached: (data) =>
    Effect.gen(function* cachedDemo() {
      const now = yield* DateTime.now;

      return {
        data,
        generatedAt: DateTime.formatIso(now),
        random: Math.random(),
      };
    }),
  rateLimited: (message) =>
    Effect.gen(function* rateLimitedDemo() {
      const now = yield* DateTime.now;

      return {
        message,
        timestamp: DateTime.formatIso(now),
      };
    }),
});
