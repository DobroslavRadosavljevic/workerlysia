import { Schema } from "effect";

const NonEmptyString = Schema.String.check(Schema.isMinLength(1));

export const KeyParamsSchema = Schema.Struct({
  key: NonEmptyString.annotate({
    description: "KV key",
  }),
});

export const KvBodySchema = Schema.Struct({
  value: Schema.String,
});

export const KvValueResponseSchema = Schema.Struct({
  key: Schema.String,
  value: Schema.String,
});

export const KvDeletedResponseSchema = Schema.Struct({
  deleted: Schema.String,
});

export type KeyParams = typeof KeyParamsSchema.Type;
export type KvBody = typeof KvBodySchema.Type;
