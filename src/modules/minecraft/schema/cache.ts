import { Schema } from "effect";

export const MinecraftCacheEntrySchema = Schema.Struct({
  expiresAt: Schema.Number,
  value: Schema.Unknown,
});

export type MinecraftCacheEntry = typeof MinecraftCacheEntrySchema.Type;
