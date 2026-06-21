import { Schema } from "effect";

export const CauseFields = {
  cause: Schema.Unknown,
  message: Schema.String,
} as const;
