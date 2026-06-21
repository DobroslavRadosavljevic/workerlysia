import { Schema } from "effect";

import {
  CacheStatusSchema,
  TextureIdSchema,
  UsernameSchema,
  UuidDashedSchema,
  UuidDashlessSchema,
  VersionIdSchema,
} from "./shared";

export const CacheInfoSchema = Schema.Struct({
  status: CacheStatusSchema,
});

export const PlayerCacheInfoSchema = Schema.Struct({
  session: CacheStatusSchema,
  username: CacheStatusSchema,
});

export const TextureMetadataSchema = Schema.Struct({
  model: Schema.optionalKey(Schema.Literals(["classic", "slim"] as const)),
  sourceUrl: Schema.String,
  textureId: TextureIdSchema,
  url: Schema.String,
});

export const PlayerResponseSchema = Schema.Struct({
  cache: PlayerCacheInfoSchema,
  cape: Schema.optionalKey(TextureMetadataSchema),
  fetchedAt: Schema.String.annotate({ format: "date-time" }),
  name: UsernameSchema,
  skin: Schema.optionalKey(TextureMetadataSchema),
  uuid: UuidDashlessSchema,
  uuidDashed: UuidDashedSchema,
});

export const ResolvedPlayerSchema = Schema.Struct({
  name: UsernameSchema,
  uuid: UuidDashlessSchema,
  uuidDashed: UuidDashedSchema,
});

export const ResolvePlayersResponseSchema = Schema.Struct({
  cache: Schema.Struct({
    hits: Schema.Number,
    misses: Schema.Number,
  }),
  missing: Schema.Array(UsernameSchema),
  resolved: Schema.Array(ResolvedPlayerSchema),
});

export const SessionPropertySchema = Schema.Struct({
  name: Schema.String,
  signature: Schema.optionalKey(Schema.String),
  value: Schema.String,
});

export const ProfileResponseSchema = Schema.Struct({
  cache: CacheInfoSchema,
  cape: Schema.optionalKey(TextureMetadataSchema),
  fetchedAt: Schema.String.annotate({ format: "date-time" }),
  name: UsernameSchema,
  properties: Schema.Array(SessionPropertySchema),
  signed: Schema.Boolean,
  skin: Schema.optionalKey(TextureMetadataSchema),
  uuid: UuidDashlessSchema,
  uuidDashed: UuidDashedSchema,
});

export const TextureResponseSchema = Schema.Any;

export const BlockedServersResponseSchema = Schema.Struct({
  cache: CacheInfoSchema,
  count: Schema.Number,
  hashes: Schema.Array(Schema.String),
});

export const VersionSummarySchema = Schema.Struct({
  id: VersionIdSchema,
  releaseTime: Schema.String,
  time: Schema.String,
  type: Schema.String,
  url: Schema.String,
});

export const VersionsResponseSchema = Schema.Struct({
  cache: CacheInfoSchema,
  latest: Schema.Struct({
    release: VersionIdSchema,
    snapshot: VersionIdSchema,
  }),
  versions: Schema.Array(VersionSummarySchema),
});

export const VersionResponseSchema = Schema.Struct({
  cache: CacheInfoSchema,
  metadata: Schema.Json,
  summary: VersionSummarySchema,
});
