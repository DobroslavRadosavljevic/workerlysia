import { Clock, Effect, Layer, Schema } from "effect";

import { getErrorMessage } from "../../../../effect/runtime";
import { CloudflareKvService } from "../../../storage/services/cloudflare-kv/service";
import { DecodeMinecraftCacheEntryError } from "../../errors/decode-minecraft-cache-entry";
import { ReadMinecraftCacheError } from "../../errors/read-minecraft-cache";
import { WriteMinecraftCacheError } from "../../errors/write-minecraft-cache";
import { MinecraftCacheEntrySchema } from "../../schema/cache";
import { MinecraftCacheService } from "./service";

export const MinecraftCacheLive = Layer.effect(
  MinecraftCacheService,
  Effect.gen(function* makeMinecraftCache() {
    const kv = yield* CloudflareKvService;

    return {
      getJson: <S extends Schema.Top>(key: string, schema: S) =>
        Effect.gen(function* getCachedJson() {
          const raw = yield* kv.get(key).pipe(
            Effect.mapError(
              (cause) =>
                new ReadMinecraftCacheError({
                  cause,
                  key,
                  message: getErrorMessage(cause),
                })
            )
          );

          if (raw === null) {
            return null;
          }

          const entry = yield* Schema.decodeUnknownEffect(
            Schema.fromJsonString(MinecraftCacheEntrySchema)
          )(raw).pipe(
            Effect.mapError(
              (cause) =>
                new DecodeMinecraftCacheEntryError({
                  cause,
                  key,
                  message: getErrorMessage(cause),
                })
            )
          );

          const now = yield* Clock.currentTimeMillis;

          if (entry.expiresAt <= now) {
            return null;
          }

          const value = yield* Schema.decodeUnknownEffect(schema)(
            entry.value
          ).pipe(
            Effect.mapError(
              (cause) =>
                new DecodeMinecraftCacheEntryError({
                  cause,
                  key,
                  message: getErrorMessage(cause),
                })
            )
          );

          return {
            status: "hit" as const,
            value,
          };
        }),
      putJson: (key, value, ttlSeconds) =>
        Effect.gen(function* putCachedJson() {
          const now = yield* Clock.currentTimeMillis;
          const payload = JSON.stringify({
            expiresAt: now + ttlSeconds * 1000,
            value,
          });

          yield* kv.put(key, payload, { expirationTtl: ttlSeconds }).pipe(
            Effect.mapError(
              (cause) =>
                new WriteMinecraftCacheError({
                  cause,
                  key,
                  message: getErrorMessage(cause),
                })
            )
          );
        }),
    };
  })
);
