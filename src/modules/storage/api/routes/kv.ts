import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import {
  ErrorMessageResponseSchema,
  ErrorOnlyResponseSchema,
} from "../../../shared/schema/api/response";
import { KvBodySchema } from "../../schema/api/body";
import { KeyParamsSchema } from "../../schema/api/params";
import {
  KvDeletedResponseSchema,
  KvValueResponseSchema,
} from "../../schema/api/response";
import { CloudflareKv } from "../../services/cloudflare-kv/service";

export const kvRoutes = new Elysia({ prefix: "/kv" })
  .get(
    "/:key",
    ({ params, status }) =>
      RouteRuntime.runPromise(
        CloudflareKv.use((kv) => kv.get(params.key)).pipe(
          Effect.map((value) =>
            value === null
              ? status(404, { error: "Key not found" })
              : status(200, { key: params.key, value })
          ),
          Effect.catchTags({
            GetKvError: (error) =>
              Effect.succeed(
                status(500, {
                  error: "Failed to retrieve key",
                  message: error.message,
                })
              ),
          })
        )
      ),
    {
      detail: {
        summary: "Get value by key",
        tags: ["KV"],
      },
      params: Schema.toStandardSchemaV1(KeyParamsSchema),
      response: {
        200: Schema.toStandardSchemaV1(KvValueResponseSchema),
        404: Schema.toStandardSchemaV1(ErrorOnlyResponseSchema),
        500: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      },
    }
  )
  .put(
    "/:key",
    ({ body, params, status }) =>
      RouteRuntime.runPromise(
        CloudflareKv.use((kv) => kv.put(params.key, body.value)).pipe(
          Effect.map(() =>
            status(200, {
              key: params.key,
              value: body.value,
            })
          ),
          Effect.catchTags({
            PutKvError: (error) =>
              Effect.succeed(
                status(500, {
                  error: "Failed to store key",
                  message: error.message,
                })
              ),
          })
        )
      ),
    {
      body: Schema.toStandardSchemaV1(KvBodySchema),
      detail: {
        summary: "Set value for key",
        tags: ["KV"],
      },
      params: Schema.toStandardSchemaV1(KeyParamsSchema),
      response: {
        200: Schema.toStandardSchemaV1(KvValueResponseSchema),
        500: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      },
    }
  )
  .delete(
    "/:key",
    ({ params, status }) =>
      RouteRuntime.runPromise(
        CloudflareKv.use((kv) => kv.delete(params.key)).pipe(
          Effect.map(() => status(200, { deleted: params.key })),
          Effect.catchTags({
            DeleteKvError: (error) =>
              Effect.succeed(
                status(500, {
                  error: "Failed to delete key",
                  message: error.message,
                })
              ),
          })
        )
      ),
    {
      detail: {
        summary: "Delete key",
        tags: ["KV"],
      },
      params: Schema.toStandardSchemaV1(KeyParamsSchema),
      response: {
        200: Schema.toStandardSchemaV1(KvDeletedResponseSchema),
        500: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      },
    }
  );
