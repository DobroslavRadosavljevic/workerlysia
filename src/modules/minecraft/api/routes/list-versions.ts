import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import { ErrorMessageResponseSchema } from "../../../shared/schema/api/response";
import { VersionsResponseSchema } from "../../schema/api/response";
import { MinecraftService } from "../../services/minecraft/service";

export const listMinecraftVersionsRoute = new Elysia().get(
  "/minecraft/versions",
  ({ status }) =>
    RouteRuntime.runPromise(
      MinecraftService.use((minecraft) => minecraft.listVersions()).pipe(
        Effect.map((result) => status(200, result)),
        Effect.catchTags({
          DecodeMinecraftCacheEntryError: (error) =>
            Effect.succeed(
              status(500, {
                error: "Minecraft cache entry is invalid",
                message: error.message,
              })
            ),
          DecodeVersionManifestResponseError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Failed to decode official Piston manifest response",
                message: error.message,
              })
            ),
          GetVersionManifestUpstreamError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Official Piston manifest request failed",
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
      summary: "List official Minecraft versions from Piston metadata",
      tags: ["Minecraft"],
    },
    response: {
      200: Schema.toStandardSchemaV1(VersionsResponseSchema),
      500: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      502: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
    },
  }
);
