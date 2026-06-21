import { env } from "cloudflare:workers";
import { Effect, Layer } from "effect";

import { getErrorMessage } from "../../../../effect/runtime";
import { DeleteKvError } from "../../errors/delete-kv";
import { GetKvError } from "../../errors/get-kv";
import { PutKvError } from "../../errors/put-kv";
import { CloudflareKvService } from "./service";

export const CloudflareKvLive = Layer.succeed(CloudflareKvService, {
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
