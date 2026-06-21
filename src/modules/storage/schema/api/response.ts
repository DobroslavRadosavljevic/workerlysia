import { Schema } from "effect";

export const KvValueResponseSchema = Schema.Struct({
  key: Schema.String,
  value: Schema.String,
});

export const KvDeletedResponseSchema = Schema.Struct({
  deleted: Schema.String,
});
