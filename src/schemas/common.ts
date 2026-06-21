import { Schema } from "effect";

export const SuccessResponseSchema = Schema.Struct({
  success: Schema.Boolean,
});

export const ErrorResponseSchema = Schema.Struct({
  error: Schema.String,
  success: Schema.Boolean,
});

export const ErrorOnlyResponseSchema = Schema.Struct({
  error: Schema.String,
});

export const ErrorMessageResponseSchema = Schema.Struct({
  error: Schema.String,
  message: Schema.String,
});

export const RateLimitHeadersSchema = Schema.Struct({
  "cf-connecting-ip": Schema.optionalKey(Schema.String),
  "x-forwarded-for": Schema.optionalKey(Schema.String),
});
