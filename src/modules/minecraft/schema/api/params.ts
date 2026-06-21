import { Schema } from "effect";

import { NameOrUuidSchema, TextureIdSchema, VersionIdSchema } from "./shared";

export const NameOrUuidParamsSchema = Schema.Struct({
  nameOrUuid: NameOrUuidSchema,
});

export const TextureParamsSchema = Schema.Struct({
  textureId: TextureIdSchema,
});

export const VersionParamsSchema = Schema.Struct({
  versionId: VersionIdSchema,
});

export type NameOrUuidParams = typeof NameOrUuidParamsSchema.Type;
export type TextureParams = typeof TextureParamsSchema.Type;
export type VersionParams = typeof VersionParamsSchema.Type;
