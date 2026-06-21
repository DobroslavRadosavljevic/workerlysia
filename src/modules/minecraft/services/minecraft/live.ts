import { Effect, Layer, Schema } from "effect";

import {
  BLOCKED_SERVERS_CACHE_KEY,
  BLOCKED_SERVERS_CACHE_TTL_SECONDS,
  SESSION_PROFILE_CACHE_TTL_SECONDS,
  USERNAME_CACHE_TTL_SECONDS,
  VERSION_MANIFEST_CACHE_KEY,
  VERSION_MANIFEST_CACHE_TTL_SECONDS,
  VERSION_METADATA_CACHE_TTL_SECONDS,
} from "../../constants";
import type { DecodeMinecraftCacheEntryError } from "../../errors/decode-minecraft-cache-entry";
import { PlayerSkinNotFoundError } from "../../errors/player-skin-not-found";
import type { ReadMinecraftCacheError } from "../../errors/read-minecraft-cache";
import { VersionNotFoundError } from "../../errors/version-not-found";
import {
  MojangProfileSchema,
  MojangSessionProfileSchema,
  PistonVersionManifestSchema,
  PistonVersionMetadataSchema,
} from "../../schema/upstream";
import type { ResolvedPlayer, ValueWithCache } from "../../types";
import { currentIsoDateTime } from "../../utils/current-iso-date-time";
import { isUuid } from "../../utils/is-uuid";
import { sessionProfileCacheKey } from "../../utils/session-profile-cache-key";
import { sessionTextureFields } from "../../utils/session-texture-fields";
import { toDashedUuid } from "../../utils/to-dashed-uuid";
import { toDashlessUuid } from "../../utils/to-dashless-uuid";
import { usernameCacheKey } from "../../utils/username-cache-key";
import { versionMetadataCacheKey } from "../../utils/version-metadata-cache-key";
import { MinecraftCacheService } from "../minecraft-cache/service";
import { MojangApiService } from "../mojang-api/service";
import { MinecraftService } from "./service";

export const MinecraftServiceLive = Layer.effect(
  MinecraftService,
  Effect.gen(function* makeMinecraftService() {
    const api = yield* MojangApiService;
    const cache = yield* MinecraftCacheService;

    const putJsonBestEffort = (
      key: string,
      value: unknown,
      ttlSeconds: number
    ) =>
      cache.putJson(key, value, ttlSeconds).pipe(
        Effect.catchTags({
          WriteMinecraftCacheError: () => Effect.asVoid(Effect.succeed(null)),
        })
      );

    const getOrFetchJson = <S extends Schema.Top, E>(
      key: string,
      schema: S,
      ttlSeconds: number,
      fetchValue: Effect.Effect<S["Type"], E>
    ): Effect.Effect<
      ValueWithCache<S["Type"]>,
      DecodeMinecraftCacheEntryError | E | ReadMinecraftCacheError,
      S["DecodingServices"]
    > =>
      Effect.gen(function* getOrFetchCachedJson() {
        const cached = yield* cache.getJson(key, schema);

        if (cached) {
          return {
            cacheStatus: cached.status,
            value: cached.value,
          };
        }

        const value = yield* fetchValue;
        yield* putJsonBestEffort(key, value, ttlSeconds);

        return {
          cacheStatus: "miss" as const,
          value,
        };
      });

    const getSessionProfile = (uuid: string, signed: boolean) =>
      getOrFetchJson(
        sessionProfileCacheKey(uuid, signed),
        MojangSessionProfileSchema,
        SESSION_PROFILE_CACHE_TTL_SECONDS,
        api.getSessionProfile(uuid, signed)
      );

    const getUsername = (username: string) =>
      getOrFetchJson(
        usernameCacheKey(username),
        MojangProfileSchema,
        USERNAME_CACHE_TTL_SECONDS,
        api.resolveUsername(username)
      );

    const resolvePlayerUuid = (nameOrUuid: string) =>
      isUuid(nameOrUuid)
        ? Effect.succeed(toDashlessUuid(nameOrUuid))
        : getUsername(nameOrUuid).pipe(
            Effect.map((username) => username.value.id)
          );

    const getProfileResponse = (nameOrUuid: string, signed: boolean) =>
      Effect.gen(function* buildProfileResponse() {
        const dashlessUuid = yield* resolvePlayerUuid(nameOrUuid);
        const profile = yield* getSessionProfile(dashlessUuid, signed);
        const textures = yield* sessionTextureFields(profile.value);
        const fetchedAt = yield* currentIsoDateTime;

        return {
          cache: {
            status: profile.cacheStatus,
          },
          fetchedAt,
          name: profile.value.name,
          properties: profile.value.properties,
          signed,
          uuid: profile.value.id,
          uuidDashed: toDashedUuid(profile.value.id),
          ...(textures.cape ? { cape: textures.cape } : {}),
          ...(textures.skin ? { skin: textures.skin } : {}),
        };
      });

    return {
      getBlockedServers: () =>
        Effect.gen(function* getBlockedServers() {
          const blockedServers = yield* getOrFetchJson(
            BLOCKED_SERVERS_CACHE_KEY,
            Schema.String,
            BLOCKED_SERVERS_CACHE_TTL_SECONDS,
            api.getBlockedServers()
          );
          const hashes = blockedServers.value
            .split("\n")
            .map((hash) => hash.trim())
            .filter((hash) => hash.length > 0);

          return {
            cache: {
              status: blockedServers.cacheStatus,
            },
            count: hashes.length,
            hashes,
          };
        }),
      getPlayer: (nameOrUuid) =>
        Effect.gen(function* getPlayer() {
          const username = isUuid(nameOrUuid)
            ? null
            : yield* getUsername(nameOrUuid);
          const uuid = username
            ? username.value.id
            : toDashlessUuid(nameOrUuid);
          const profile = yield* getSessionProfile(uuid, false);
          const textures = yield* sessionTextureFields(profile.value);
          const fetchedAt = yield* currentIsoDateTime;

          return {
            cache: {
              session: profile.cacheStatus,
              username: username?.cacheStatus ?? "skipped",
            },
            fetchedAt,
            name: profile.value.name,
            uuid: profile.value.id,
            uuidDashed: toDashedUuid(profile.value.id),
            ...(textures.cape ? { cape: textures.cape } : {}),
            ...(textures.skin ? { skin: textures.skin } : {}),
          };
        }),
      getProfile: getProfileResponse,
      getSkinTexture: (nameOrUuid) =>
        Effect.gen(function* getSkinTexture() {
          const profile = yield* getProfileResponse(nameOrUuid, false);

          if (!profile.skin) {
            return yield* Effect.fail(
              new PlayerSkinNotFoundError({ uuid: profile.uuid })
            );
          }

          return yield* api.getTexture(profile.skin.textureId);
        }),
      getTexture: (textureId) => api.getTexture(textureId.toLowerCase()),
      getVersion: (versionId) =>
        Effect.gen(function* getVersion() {
          const manifest = yield* getOrFetchJson(
            VERSION_MANIFEST_CACHE_KEY,
            PistonVersionManifestSchema,
            VERSION_MANIFEST_CACHE_TTL_SECONDS,
            api.getVersionManifest()
          );
          const summary = manifest.value.versions.find(
            (version) => version.id === versionId
          );

          if (!summary) {
            return yield* Effect.fail(new VersionNotFoundError({ versionId }));
          }

          const metadata = yield* getOrFetchJson(
            versionMetadataCacheKey(versionId),
            PistonVersionMetadataSchema,
            VERSION_METADATA_CACHE_TTL_SECONDS,
            api.getVersionMetadata(versionId, summary.url)
          );

          return {
            cache: {
              status: metadata.cacheStatus,
            },
            metadata: metadata.value,
            summary,
          };
        }),
      listVersions: () =>
        Effect.gen(function* listVersions() {
          const manifest = yield* getOrFetchJson(
            VERSION_MANIFEST_CACHE_KEY,
            PistonVersionManifestSchema,
            VERSION_MANIFEST_CACHE_TTL_SECONDS,
            api.getVersionManifest()
          );

          return {
            cache: {
              status: manifest.cacheStatus,
            },
            latest: manifest.value.latest,
            versions: manifest.value.versions,
          };
        }),
      resolvePlayers: (usernames) =>
        Effect.gen(function* resolvePlayers() {
          const uniqueUsernames = [...new Set(usernames)];
          const resolved: ResolvedPlayer[] = [];
          const cacheMisses: string[] = [];
          let cacheHits = 0;

          for (const username of uniqueUsernames) {
            const cached = yield* cache.getJson(
              usernameCacheKey(username),
              MojangProfileSchema
            );

            if (cached) {
              cacheHits += 1;
              resolved.push({
                name: cached.value.name,
                uuid: cached.value.id,
                uuidDashed: toDashedUuid(cached.value.id),
              });
            } else {
              cacheMisses.push(username);
            }
          }

          const upstreamResolved =
            cacheMisses.length > 0
              ? yield* api.resolveUsernames(cacheMisses)
              : [];
          const foundNames = new Set(
            upstreamResolved.map((profile) => profile.name.toLowerCase())
          );

          for (const profile of upstreamResolved) {
            yield* putJsonBestEffort(
              usernameCacheKey(profile.name),
              profile,
              USERNAME_CACHE_TTL_SECONDS
            );
            resolved.push({
              name: profile.name,
              uuid: profile.id,
              uuidDashed: toDashedUuid(profile.id),
            });
          }

          return {
            cache: {
              hits: cacheHits,
              misses: cacheMisses.length,
            },
            missing: cacheMisses.filter(
              (username) => !foundNames.has(username.toLowerCase())
            ),
            resolved,
          };
        }),
    };
  })
);
