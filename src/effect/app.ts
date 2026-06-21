import { Layer, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/unstable/http";

import { MinecraftCacheLive } from "../modules/minecraft/services/minecraft-cache/live";
import { MinecraftServiceLive } from "../modules/minecraft/services/minecraft/live";
import { MojangApiLive } from "../modules/minecraft/services/mojang-api/live";
import { CloudflareKvLive } from "../modules/storage/services/cloudflare-kv/live";

const MinecraftCacheLayer = MinecraftCacheLive.pipe(
  Layer.provide(CloudflareKvLive)
);

const MojangApiLayer = MojangApiLive.pipe(Layer.provide(FetchHttpClient.layer));

const AppLayer = MinecraftServiceLive.pipe(
  Layer.provide(Layer.mergeAll(MojangApiLayer, MinecraftCacheLayer))
);

export const RouteRuntime = ManagedRuntime.make(AppLayer);
