import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import {
  ErrorMessageResponseSchema,
  ErrorOnlyResponseSchema,
} from "../../../shared/schema/api/response";
import { VersionParamsSchema } from "../../schema/api/params";
import { VersionResponseSchema } from "../../schema/api/response";
import { MinecraftService } from "../../services/minecraft/service";

export const getMinecraftVersionRoute = new Elysia().get(
  "/minecraft/versions/:versionId",
  ({ params, status }) =>
    RouteRuntime.runPromise(
      MinecraftService.use((minecraft) =>
        minecraft.getVersion(params.versionId)
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
          DecodeVersionManifestResponseError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Failed to decode official Piston manifest response",
                message: error.message,
              })
            ),
          DecodeVersionMetadataResponseError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Failed to decode official Piston version response",
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
          GetVersionMetadataUpstreamError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Official Piston version metadata request failed",
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
          VersionNotFoundError: () =>
            Effect.succeed(
              status(404, { error: "Minecraft version not found" })
            ),
        })
      )
    ),
  {
    detail: {
      summary: "Get official Minecraft version metadata by version id",
      tags: ["Minecraft"],
    },
    params: Schema.toStandardSchemaV1(VersionParamsSchema),
    response: {
      200: Schema.toStandardSchemaV1(VersionResponseSchema),
      404: Schema.toStandardSchemaV1(ErrorOnlyResponseSchema),
      500: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      502: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
    },
  }
);
