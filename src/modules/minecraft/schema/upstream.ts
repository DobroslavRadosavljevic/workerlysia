import { Schema } from "effect";

import {
  TextureIdSchema,
  UsernameSchema,
  UuidDashlessSchema,
  VersionIdSchema,
} from "./api/shared";

export const MojangProfileSchema = Schema.Struct({
  id: UuidDashlessSchema,
  name: UsernameSchema,
});

export const MojangProfileListSchema = Schema.Array(MojangProfileSchema);

export const MojangSessionPropertySchema = Schema.Struct({
  name: Schema.String,
  signature: Schema.optionalKey(Schema.String),
  value: Schema.String,
});

export const MojangSessionProfileSchema = Schema.Struct({
  id: UuidDashlessSchema,
  name: UsernameSchema,
  properties: Schema.Array(MojangSessionPropertySchema),
});

export const MojangTextureMetadataSchema = Schema.Struct({
  model: Schema.optionalKey(Schema.Literal("slim")),
});

export const MojangTextureEntrySchema = Schema.Struct({
  metadata: Schema.optionalKey(MojangTextureMetadataSchema),
  url: Schema.String.check(
    Schema.isPattern(
      /^https?:\/\/textures\.minecraft\.net\/texture\/[0-9a-fA-F]{64}$/u
    )
  ),
});

export const MojangTexturePayloadSchema = Schema.Struct({
  profileId: UuidDashlessSchema,
  profileName: UsernameSchema,
  textures: Schema.Struct({
    CAPE: Schema.optionalKey(MojangTextureEntrySchema),
    SKIN: Schema.optionalKey(MojangTextureEntrySchema),
  }),
  timestamp: Schema.optionalKey(Schema.Number),
});

export const PistonVersionSummarySchema = Schema.Struct({
  id: VersionIdSchema,
  releaseTime: Schema.String,
  sha1: Schema.optionalKey(Schema.String),
  time: Schema.String,
  type: Schema.String,
  url: Schema.String.check(
    Schema.isPattern(/^https:\/\/piston-meta\.mojang\.com\/.+\.json$/u)
  ),
});

export const PistonVersionManifestSchema = Schema.Struct({
  latest: Schema.Struct({
    release: VersionIdSchema,
    snapshot: VersionIdSchema,
  }),
  versions: Schema.Array(PistonVersionSummarySchema),
});

export const PistonVersionMetadataSchema = Schema.Json;

export const TextureIdFromUrlSchema = TextureIdSchema;

export type MojangProfile = typeof MojangProfileSchema.Type;
export type MojangSessionProfile = typeof MojangSessionProfileSchema.Type;
export type MojangTexturePayload = typeof MojangTexturePayloadSchema.Type;
export type PistonVersionManifest = typeof PistonVersionManifestSchema.Type;
export type PistonVersionSummary = typeof PistonVersionSummarySchema.Type;
export type PistonVersionMetadata = typeof PistonVersionMetadataSchema.Type;
