import { Layer, ManagedRuntime } from "effect";

import { CloudflareKvLive } from "../services/cloudflare-kv";
import { TaskServiceLive } from "../services/tasks";

const AppLayer = Layer.mergeAll(CloudflareKvLive, TaskServiceLive);

export const RouteRuntime = ManagedRuntime.make(AppLayer);
