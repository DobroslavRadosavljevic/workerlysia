import { Schema } from "effect";

export const KvBodySchema = Schema.Struct({
  value: Schema.String,
});

export type KvBody = typeof KvBodySchema.Type;
