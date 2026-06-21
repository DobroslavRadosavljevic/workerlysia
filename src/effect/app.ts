import { Layer, ManagedRuntime } from "effect";

import { CacheServiceLive } from "../services/cache";
import { CloudflareKvLive } from "../services/cloudflare-kv";
import { DemoServiceLive } from "../services/demo";
import { RateLimitServiceLive } from "../services/rate-limit";
import { TaskServiceLive } from "../services/tasks";

const AppLayer = Layer.mergeAll(
  CloudflareKvLive,
  CacheServiceLive.pipe(Layer.provide(CloudflareKvLive)),
  RateLimitServiceLive.pipe(Layer.provide(CloudflareKvLive)),
  TaskServiceLive,
  DemoServiceLive
);

export const RouteRuntime = ManagedRuntime.make(AppLayer);
