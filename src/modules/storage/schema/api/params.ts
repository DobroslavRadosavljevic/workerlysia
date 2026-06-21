import { Schema } from "effect";

const NonEmptyString = Schema.String.check(Schema.isMinLength(1));

export const KeyParamsSchema = Schema.Struct({
  key: NonEmptyString.annotate({
    description: "KV key",
  }),
});

export type KeyParams = typeof KeyParamsSchema.Type;
