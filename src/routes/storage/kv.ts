import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../effect/app";
import {
  ErrorMessageResponseSchema,
  ErrorOnlyResponseSchema,
} from "../../schemas/common";
import {
  KeyParamsSchema,
  KvBodySchema,
  KvDeletedResponseSchema,
  KvValueResponseSchema,
} from "../../schemas/kv";
import { CloudflareKv } from "../../services/cloudflare-kv";

export const kvRoutes = new Elysia({ prefix: "/kv" })
  .get(
    "/:key",
    ({ params, status }) =>
      RouteRuntime.runPromise(
        Effect.gen(function* getKvValue() {
          const kv = yield* CloudflareKv;
          const result = yield* Effect.result(kv.get(params.key));

          if (result._tag === "Failure") {
            return status(500, {
              error: "Failed to retrieve key",
              message: result.failure.message,
            });
          }

          return result.success === null
            ? status(404, { error: "Key not found" })
            : { key: params.key, value: result.success };
        })
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
        Effect.gen(function* putKvValue() {
          const kv = yield* CloudflareKv;
          const result = yield* Effect.result(kv.put(params.key, body.value));

          if (result._tag === "Failure") {
            return status(500, {
              error: "Failed to store key",
              message: result.failure.message,
            });
          }

          return {
            key: params.key,
            value: body.value,
          };
        })
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
        Effect.gen(function* deleteKvValue() {
          const kv = yield* CloudflareKv;
          const result = yield* Effect.result(kv.delete(params.key));

          if (result._tag === "Failure") {
            return status(500, {
              error: "Failed to delete key",
              message: result.failure.message,
            });
          }

          return { deleted: params.key };
        })
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
