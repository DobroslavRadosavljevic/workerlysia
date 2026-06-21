import { Context } from "effect";
import type { Effect } from "effect";

import type { DeleteKvError } from "../../errors/delete-kv";
import type { GetKvError } from "../../errors/get-kv";
import type { PutKvError } from "../../errors/put-kv";

export class CloudflareKvService extends Context.Service<
  CloudflareKvService,
  {
    readonly delete: (key: string) => Effect.Effect<void, DeleteKvError>;
    readonly get: (key: string) => Effect.Effect<string | null, GetKvError>;
    readonly put: (
      key: string,
      value: string,
      options?: NonNullable<Parameters<KVNamespace["put"]>[2]>
    ) => Effect.Effect<void, PutKvError>;
  }
>()("CloudflareKvService") {}
