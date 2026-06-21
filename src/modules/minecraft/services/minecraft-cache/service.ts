import { Context } from "effect";
import type { Effect, Schema } from "effect";

import type { DecodeMinecraftCacheEntryError } from "../../errors/decode-minecraft-cache-entry";
import type { ReadMinecraftCacheError } from "../../errors/read-minecraft-cache";
import type { WriteMinecraftCacheError } from "../../errors/write-minecraft-cache";
import type { CachedValue } from "../../types";

export class MinecraftCacheService extends Context.Service<
  MinecraftCacheService,
  {
    readonly getJson: <S extends Schema.Top>(
      key: string,
      schema: S
    ) => Effect.Effect<
      CachedValue<S["Type"]> | null,
      DecodeMinecraftCacheEntryError | ReadMinecraftCacheError,
      S["DecodingServices"]
    >;
    readonly putJson: (
      key: string,
      value: unknown,
      ttlSeconds: number
    ) => Effect.Effect<void, WriteMinecraftCacheError>;
  }
>()("MinecraftCacheService") {}
