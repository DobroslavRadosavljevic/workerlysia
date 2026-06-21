import { Schema } from "effect";

export const WelcomeResponseSchema = Schema.Struct({
  docs: Schema.String,
  message: Schema.String,
  version: Schema.String,
});
