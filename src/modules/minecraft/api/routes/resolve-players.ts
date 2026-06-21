import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import { ErrorMessageResponseSchema } from "../../../shared/schema/api/response";
import { ResolvePlayersBodySchema } from "../../schema/api/body";
import { ResolvePlayersResponseSchema } from "../../schema/api/response";
import { MinecraftService } from "../../services/minecraft/service";

export const resolveMinecraftPlayersRoute = new Elysia().post(
  "/minecraft/players/resolve",
  ({ body, status }) =>
    RouteRuntime.runPromise(
      MinecraftService.use((minecraft) =>
        minecraft.resolvePlayers(body.usernames)
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
          DecodeUsernamesLookupResponseError: (error) =>
            Effect.succeed(
              status(502, {
                error: "Failed to decode official Minecraft username response",
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
          ResolveUsernamesUpstreamError: (error) =>
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
    body: Schema.toStandardSchemaV1(ResolvePlayersBodySchema),
    detail: {
      summary: "Resolve Minecraft usernames in bulk",
      tags: ["Minecraft"],
    },
    response: {
      200: Schema.toStandardSchemaV1(ResolvePlayersResponseSchema),
      500: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      502: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
    },
  }
);
