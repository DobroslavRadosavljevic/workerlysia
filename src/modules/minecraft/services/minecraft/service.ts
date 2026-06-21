import { Context } from "effect";
import type { Effect } from "effect";

import type {
  BlockedServersResponseSchema,
  PlayerResponseSchema,
  ProfileResponseSchema,
  ResolvePlayersResponseSchema,
  VersionResponseSchema,
  VersionsResponseSchema,
} from "../../schema/api/response";
import type { MinecraftServiceError, MinecraftTextureFile } from "../../types";

export class MinecraftService extends Context.Service<
  MinecraftService,
  {
    readonly getBlockedServers: () => Effect.Effect<
      typeof BlockedServersResponseSchema.Type,
      MinecraftServiceError
    >;
    readonly getPlayer: (
      nameOrUuid: string
    ) => Effect.Effect<typeof PlayerResponseSchema.Type, MinecraftServiceError>;
    readonly getProfile: (
      nameOrUuid: string,
      signed: boolean
    ) => Effect.Effect<
      typeof ProfileResponseSchema.Type,
      MinecraftServiceError
    >;
    readonly getSkinTexture: (
      nameOrUuid: string
    ) => Effect.Effect<MinecraftTextureFile, MinecraftServiceError>;
    readonly getTexture: (
      textureId: string
    ) => Effect.Effect<MinecraftTextureFile, MinecraftServiceError>;
    readonly getVersion: (
      versionId: string
    ) => Effect.Effect<
      typeof VersionResponseSchema.Type,
      MinecraftServiceError
    >;
    readonly listVersions: () => Effect.Effect<
      typeof VersionsResponseSchema.Type,
      MinecraftServiceError
    >;
    readonly resolvePlayers: (
      usernames: readonly string[]
    ) => Effect.Effect<
      typeof ResolvePlayersResponseSchema.Type,
      MinecraftServiceError
    >;
  }
>()("MinecraftService") {}
