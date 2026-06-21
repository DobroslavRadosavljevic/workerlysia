import type { DecodeMinecraftCacheEntryError } from "./errors/decode-minecraft-cache-entry";
import type { DecodeSessionProfileResponseError } from "./errors/decode-session-profile-response";
import type { DecodeTexturePayloadError } from "./errors/decode-texture-payload";
import type { DecodeUsernameLookupResponseError } from "./errors/decode-username-lookup-response";
import type { DecodeUsernamesLookupResponseError } from "./errors/decode-usernames-lookup-response";
import type { DecodeVersionManifestResponseError } from "./errors/decode-version-manifest-response";
import type { DecodeVersionMetadataResponseError } from "./errors/decode-version-metadata-response";
import type { GetBlockedServersUpstreamError } from "./errors/get-blocked-servers-upstream";
import type { GetSessionProfileUpstreamError } from "./errors/get-session-profile-upstream";
import type { GetTextureUpstreamError } from "./errors/get-texture-upstream";
import type { GetVersionManifestUpstreamError } from "./errors/get-version-manifest-upstream";
import type { GetVersionMetadataUpstreamError } from "./errors/get-version-metadata-upstream";
import type { PlayerNotFoundError } from "./errors/player-not-found";
import type { PlayerSkinNotFoundError } from "./errors/player-skin-not-found";
import type { ReadMinecraftCacheError } from "./errors/read-minecraft-cache";
import type { ResolveUsernameUpstreamError } from "./errors/resolve-username-upstream";
import type { ResolveUsernamesUpstreamError } from "./errors/resolve-usernames-upstream";
import type { TextureNotFoundError } from "./errors/texture-not-found";
import type { VersionNotFoundError } from "./errors/version-not-found";
import type { ResolvedPlayerSchema } from "./schema/api/response";
import type { MojangTexturePayloadSchema } from "./schema/upstream";

export interface CachedValue<A> {
  readonly status: "hit";
  readonly value: A;
}

export type CacheStatus = "hit" | "miss" | "skipped";

export interface ValueWithCache<A> {
  readonly cacheStatus: Exclude<CacheStatus, "skipped">;
  readonly value: A;
}

export interface MinecraftTextureFile {
  readonly body: ArrayBuffer;
  readonly contentType: string;
  readonly etag: string | null;
  readonly lastModified: string | null;
}

export interface NormalizedTexture {
  readonly model?: "classic" | "slim";
  readonly sourceUrl: string;
  readonly textureId: string;
  readonly url: string;
}

export interface NormalizedTextures {
  readonly cape?: NormalizedTexture;
  readonly skin?: NormalizedTexture;
}

export type MojangTextureEntry =
  (typeof MojangTexturePayloadSchema.Type)["textures"]["SKIN"];

export type ResolvedPlayer = typeof ResolvedPlayerSchema.Type;

export type MinecraftServiceError =
  | DecodeMinecraftCacheEntryError
  | DecodeSessionProfileResponseError
  | DecodeTexturePayloadError
  | DecodeUsernameLookupResponseError
  | DecodeUsernamesLookupResponseError
  | DecodeVersionManifestResponseError
  | DecodeVersionMetadataResponseError
  | GetBlockedServersUpstreamError
  | GetSessionProfileUpstreamError
  | GetTextureUpstreamError
  | GetVersionManifestUpstreamError
  | GetVersionMetadataUpstreamError
  | PlayerNotFoundError
  | PlayerSkinNotFoundError
  | ReadMinecraftCacheError
  | ResolveUsernameUpstreamError
  | ResolveUsernamesUpstreamError
  | TextureNotFoundError
  | VersionNotFoundError;
