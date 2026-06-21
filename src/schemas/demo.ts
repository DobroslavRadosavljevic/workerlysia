import { Schema } from "effect";

const IsoTimestamp = Schema.String.annotate({
  examples: ["2026-06-21T12:00:00.000Z"],
  format: "date-time",
});

export const CachedDemoResponseSchema = Schema.Struct({
  data: Schema.Literals([
    "This response is NOT cached",
    "This response is cached",
    "This response is cached for longer",
  ]),
  generatedAt: IsoTimestamp,
  random: Schema.Number,
});

export const RateLimitedDemoResponseSchema = Schema.Struct({
  message: Schema.Literals([
    "This endpoint has no rate limit",
    "This endpoint has strict rate limiting",
    "This endpoint is rate limited",
  ]),
  timestamp: IsoTimestamp,
});
