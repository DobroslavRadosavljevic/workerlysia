import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import { ErrorMessageResponseSchema } from "../../../shared/schema/api/response";
import { BlockedServersResponseSchema } from "../../schema/api/response";
import { MinecraftService } from "../../services/minecraft/service";

export const getMinecraftBlockedServersRoute = new Elysia().get(
  "/minecraft/blocked-servers",
  ({ status }) =>
    RouteRuntime.runPromise(
      MinecraftService.use((minecraft) => minecraft.getBlockedServers()).pipe(
        Effect.map((result) => status(200, result)),
        Effect.catchTags({
          DecodeMinecraftCacheEntryError: (error) =>
            Effect.succeed(
              status(500, {
                error: "Minecraft cache entry is invalid",
                message: error.message,
              })
            ),
          GetBlockedServersUpstreamError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Official Minecraft blocked servers request failed",
                message: error.message,
              })
            ),
          ReadMinecraftCacheError: (error) =>
            Effect.succeed(
              status(500, {
                error: "Failed to read Minecraft cache",
                message: error.message,
              })
            ),
        })
      )
    ),
  {
    detail: {
      summary: "Get the official Mojang blocked server hash list",
      tags: ["Minecraft"],
    },
    response: {
      200: Schema.toStandardSchemaV1(BlockedServersResponseSchema),
      500: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      502: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
    },
  }
);
