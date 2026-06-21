import { Schema } from "effect";

export class RateLimitExceededError extends Schema.TaggedErrorClass<RateLimitExceededError>()(
  "RateLimitExceededError",
  {
    max: Schema.Number,
    retryAfter: Schema.Number,
  }
) {}
