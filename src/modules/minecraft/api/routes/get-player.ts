import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import {
  ErrorMessageResponseSchema,
  ErrorOnlyResponseSchema,
} from "../../../shared/schema/api/response";
import { NameOrUuidParamsSchema } from "../../schema/api/params";
import { PlayerResponseSchema } from "../../schema/api/response";
import { MinecraftService } from "../../services/minecraft/service";

export const getMinecraftPlayerRoute = new Elysia().get(
  "/minecraft/players/:nameOrUuid",
  ({ params, status }) =>
    RouteRuntime.runPromise(
      MinecraftService.use((minecraft) =>
        minecraft.getPlayer(params.nameOrUuid)
      ).pipe(
        Effect.map((result) => status(200, result)),
        Effect.catchTags({
          DecodeMinecraftCacheEntryError: (error) =>
            Effect.succeed(
              status(500, {
                error: "Minecraft cache entry is invalid",
                message: error.message,
              })
            ),
          DecodeSessionProfileResponseError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Failed to decode official Minecraft profile response",
                message: error.message,
              })
            ),
          DecodeTexturePayloadError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Failed to decode official Minecraft texture payload",
                message: error.message,
              })
            ),
          DecodeUsernameLookupResponseError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Failed to decode official Minecraft username response",
                message: error.message,
              })
            ),
          GetSessionProfileUpstreamError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Official Minecraft profile API request failed",
                message: error.message,
              })
            ),
          PlayerNotFoundError: () =>
            Effect.succeed(
              status(404, { error: "Minecraft player not found" })
            ),
          ReadMinecraftCacheError: (error) =>
            Effect.succeed(
              status(500, {
                error: "Failed to read Minecraft cache",
                message: error.message,
              })
            ),
          ResolveUsernameUpstreamError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Official Minecraft username API request failed",
                message: error.message,
              })
            ),
        })
      )
    ),
  {
    detail: {
      summary: "Resolve a Minecraft player by username or UUID",
      tags: ["Minecraft"],
    },
    params: Schema.toStandardSchemaV1(NameOrUuidParamsSchema),
    response: {
      200: Schema.toStandardSchemaV1(PlayerResponseSchema),
      404: Schema.toStandardSchemaV1(ErrorOnlyResponseSchema),
      500: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      502: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
    },
  }
);
