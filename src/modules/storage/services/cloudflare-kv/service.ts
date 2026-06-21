import { env } from "cloudflare:workers";
import { Context, Effect, Layer } from "effect";

import { getErrorMessage } from "../../../../effect/runtime";
import { DeleteKvError } from "../../errors/delete-kv";
import { GetKvError } from "../../errors/get-kv";
import { PutKvError } from "../../errors/put-kv";

type KvPutOptions = NonNullable<Parameters<KVNamespace["put"]>[2]>;

export class CloudflareKv extends Context.Service<
  CloudflareKv,
  {
    readonly delete: (key: string) => Effect.Effect<void, DeleteKvError>;
    readonly get: (key: string) => Effect.Effect<string | null, GetKvError>;
    readonly put: (
      key: string,
      value: string,
      options?: KvPutOptions
    ) => Effect.Effect<void, PutKvError>;
  }
>()("CloudflareKv") {}

export const CloudflareKvLive = Layer.succeed(CloudflareKv, {
  delete: (key) =>
    Effect.tryPromise({
      catch: (cause) =>
        new DeleteKvError({
          cause,
          key,
          message: getErrorMessage(cause),
        }),
      try: () => env.KV.delete(key),
    }),
  get: (key) =>
    Effect.tryPromise({
      catch: (cause) =>
        new GetKvError({
          cause,
          key,
          message: getErrorMessage(cause),
        }),
      try: () => env.KV.get(key),
    }),
  put: (key, value, options) =>
    Effect.tryPromise({
      catch: (cause) =>
        new PutKvError({
          cause,
          key,
          message: getErrorMessage(cause),
        }),
      try: () => env.KV.put(key, value, options),
    }),
});
