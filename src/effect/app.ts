import { Layer, ManagedRuntime } from "effect";

import { CloudflareKvLive } from "../modules/storage/services/cloudflare-kv/service";
import { TaskServiceLive } from "../modules/tasks/services/task/service";

const AppLayer = Layer.mergeAll(CloudflareKvLive, TaskServiceLive);

export const RouteRuntime = ManagedRuntime.make(AppLayer);
