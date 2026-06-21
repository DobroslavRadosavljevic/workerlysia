import { Context } from "effect";
import type { Effect } from "effect";

import type { DecodeSessionProfileResponseError } from "../../errors/decode-session-profile-response";
import type { DecodeUsernameLookupResponseError } from "../../errors/decode-username-lookup-response";
import type { DecodeUsernamesLookupResponseError } from "../../errors/decode-usernames-lookup-response";
import type { DecodeVersionManifestResponseError } from "../../errors/decode-version-manifest-response";
import type { DecodeVersionMetadataResponseError } from "../../errors/decode-version-metadata-response";
import type { GetBlockedServersUpstreamError } from "../../errors/get-blocked-servers-upstream";
import type { GetSessionProfileUpstreamError } from "../../errors/get-session-profile-upstream";
import type { GetTextureUpstreamError } from "../../errors/get-texture-upstream";
import type { GetVersionManifestUpstreamError } from "../../errors/get-version-manifest-upstream";
import type { GetVersionMetadataUpstreamError } from "../../errors/get-version-metadata-upstream";
import type { PlayerNotFoundError } from "../../errors/player-not-found";
import type { ResolveUsernameUpstreamError } from "../../errors/resolve-username-upstream";
import type { ResolveUsernamesUpstreamError } from "../../errors/resolve-usernames-upstream";
import type { TextureNotFoundError } from "../../errors/texture-not-found";
import type {
  MojangProfileListSchema,
  MojangProfileSchema,
  MojangSessionProfileSchema,
  PistonVersionManifestSchema,
  PistonVersionMetadataSchema,
} from "../../schema/upstream";
import type { MinecraftTextureFile } from "../../types";

export class MojangApiService extends Context.Service<
  MojangApiService,
  {
    readonly getBlockedServers: () => Effect.Effect<
      string,
      GetBlockedServersUpstreamError
    >;
    readonly getSessionProfile: (
      uuid: string,
      signed: boolean
    ) => Effect.Effect<
      typeof MojangSessionProfileSchema.Type,
      | DecodeSessionProfileResponseError
      | GetSessionProfileUpstreamError
      | PlayerNotFoundError
    >;
    readonly getTexture: (
      textureId: string
    ) => Effect.Effect<
      MinecraftTextureFile,
      GetTextureUpstreamError | TextureNotFoundError
    >;
    readonly getVersionManifest: () => Effect.Effect<
      typeof PistonVersionManifestSchema.Type,
      DecodeVersionManifestResponseError | GetVersionManifestUpstreamError
    >;
    readonly getVersionMetadata: (
      versionId: string,
      url: string
    ) => Effect.Effect<
      typeof PistonVersionMetadataSchema.Type,
      DecodeVersionMetadataResponseError | GetVersionMetadataUpstreamError
    >;
    readonly resolveUsername: (
      username: string
    ) => Effect.Effect<
      typeof MojangProfileSchema.Type,
      | DecodeUsernameLookupResponseError
      | PlayerNotFoundError
      | ResolveUsernameUpstreamError
    >;
    readonly resolveUsernames: (
      usernames: readonly string[]
    ) => Effect.Effect<
      typeof MojangProfileListSchema.Type,
      DecodeUsernamesLookupResponseError | ResolveUsernamesUpstreamError
    >;
  }
>()("MojangApiService") {}
