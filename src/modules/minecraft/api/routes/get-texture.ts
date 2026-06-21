import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import {
  ErrorMessageResponseSchema,
  ErrorOnlyResponseSchema,
} from "../../../shared/schema/api/response";
import { TextureParamsSchema } from "../../schema/api/params";
import { TextureResponseSchema } from "../../schema/api/response";
import { MinecraftService } from "../../services/minecraft/service";

export const getMinecraftTextureRoute = new Elysia().get(
  "/minecraft/textures/:textureId",
  ({ params, status }) =>
    RouteRuntime.runPromise(
      MinecraftService.use((minecraft) =>
        minecraft.getTexture(params.textureId)
      ).pipe(
        Effect.map((texture) => {
          const headers = new Headers({
            "cache-control": "public, max-age=31536000, immutable",
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
          GetTextureUpstreamError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Official Minecraft texture API request failed",
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
      summary: "Proxy an official Minecraft texture by texture hash",
      tags: ["Minecraft"],
    },
    params: Schema.toStandardSchemaV1(TextureParamsSchema),
    response: {
      200: Schema.toStandardSchemaV1(TextureResponseSchema),
      404: Schema.toStandardSchemaV1(ErrorOnlyResponseSchema),
      502: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
    },
  }
);
