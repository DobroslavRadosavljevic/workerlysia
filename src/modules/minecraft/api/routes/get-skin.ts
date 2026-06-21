import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import {
  ErrorMessageResponseSchema,
  ErrorOnlyResponseSchema,
} from "../../../shared/schema/api/response";
import { NameOrUuidParamsSchema } from "../../schema/api/params";
import { TextureResponseSchema } from "../../schema/api/response";
import { MinecraftService } from "../../services/minecraft/service";

export const getMinecraftSkinRoute = new Elysia().get(
  "/minecraft/profiles/:nameOrUuid/skin",
  ({ params, status }) =>
    RouteRuntime.runPromise(
      MinecraftService.use((minecraft) =>
        minecraft.getSkinTexture(params.nameOrUuid)
      ).pipe(
        Effect.map((texture) => {
          const headers = new Headers({
            "cache-control": "public, max-age=300",
            "content-type": texture.contentType,
          });

          if (texture.etag) {
            headers.set("etag", texture.etag);
          }

          if (texture.lastModified) {
            headers.set("last-modified", texture.lastModified);
          }

          return new Response(texture.body, {
            headers,
            status: 200,
          });
        }),
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
          GetTextureUpstreamError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Official Minecraft texture API request failed",
                message: error.message,
              })
            ),
          PlayerNotFoundError: () =>
            Effect.succeed(
              status(404, { error: "Minecraft player not found" })
            ),
          PlayerSkinNotFoundError: () =>
            Effect.succeed(
              status(404, { error: "Minecraft player skin not found" })
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
          TextureNotFoundError: () =>
            Effect.succeed(
              status(404, { error: "Minecraft texture not found" })
            ),
        })
      )
    ),
  {
    detail: {
      summary: "Resolve and proxy a Minecraft player's official skin texture",
      tags: ["Minecraft"],
    },
    params: Schema.toStandardSchemaV1(NameOrUuidParamsSchema),
    response: {
      200: Schema.toStandardSchemaV1(TextureResponseSchema),
      404: Schema.toStandardSchemaV1(ErrorOnlyResponseSchema),
      500: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      502: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
    },
  }
);
