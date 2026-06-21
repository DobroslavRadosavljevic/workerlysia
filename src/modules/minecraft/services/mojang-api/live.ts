import { Effect, Layer, Schema } from "effect";
import { HttpClient, HttpClientRequest } from "effect/unstable/http";

import { getErrorMessage } from "../../../../effect/runtime";
import {
  MINECRAFT_SERVICES_BASE_URL,
  PISTON_META_BASE_URL,
  SESSION_SERVER_BASE_URL,
  TEXTURES_BASE_URL,
} from "../../constants";
import { DecodeSessionProfileResponseError } from "../../errors/decode-session-profile-response";
import { DecodeUsernameLookupResponseError } from "../../errors/decode-username-lookup-response";
import { DecodeUsernamesLookupResponseError } from "../../errors/decode-usernames-lookup-response";
import { DecodeVersionManifestResponseError } from "../../errors/decode-version-manifest-response";
import { DecodeVersionMetadataResponseError } from "../../errors/decode-version-metadata-response";
import { GetBlockedServersUpstreamError } from "../../errors/get-blocked-servers-upstream";
import { GetSessionProfileUpstreamError } from "../../errors/get-session-profile-upstream";
import { GetTextureUpstreamError } from "../../errors/get-texture-upstream";
import { GetVersionManifestUpstreamError } from "../../errors/get-version-manifest-upstream";
import { GetVersionMetadataUpstreamError } from "../../errors/get-version-metadata-upstream";
import { PlayerNotFoundError } from "../../errors/player-not-found";
import { ResolveUsernameUpstreamError } from "../../errors/resolve-username-upstream";
import { ResolveUsernamesUpstreamError } from "../../errors/resolve-usernames-upstream";
import { TextureNotFoundError } from "../../errors/texture-not-found";
import {
  MojangProfileListSchema,
  MojangProfileSchema,
  MojangSessionProfileSchema,
  PistonVersionManifestSchema,
  PistonVersionMetadataSchema,
} from "../../schema/upstream";
import { headerOrNull } from "../../utils/header-or-null";
import { isOfficialPistonMetadataUrl } from "../../utils/is-official-piston-metadata-url";
import { statusMessage } from "../../utils/status-message";
import { MojangApiService } from "./service";

export const MojangApiLive = Layer.effect(
  MojangApiService,
  Effect.gen(function* makeMojangApi() {
    const client = yield* HttpClient.HttpClient;

    return {
      getBlockedServers: () =>
        client.get(`${SESSION_SERVER_BASE_URL}/blockedservers`).pipe(
          Effect.mapError(
            (cause) =>
              new GetBlockedServersUpstreamError({
                cause,
                message: getErrorMessage(cause),
              })
          ),
          Effect.flatMap((response) => {
            if (response.status < 200 || response.status >= 300) {
              return Effect.fail(
                new GetBlockedServersUpstreamError({
                  cause: statusMessage(response),
                  message: statusMessage(response),
                  statusCode: response.status,
                })
              );
            }

            return response.text.pipe(
              Effect.mapError(
                (cause) =>
                  new GetBlockedServersUpstreamError({
                    cause,
                    message: getErrorMessage(cause),
                  })
              )
            );
          })
        ),
      getSessionProfile: (uuid, signed) =>
        client
          .get(
            `${SESSION_SERVER_BASE_URL}/session/minecraft/profile/${uuid}${
              signed ? "?unsigned=false" : ""
            }`
          )
          .pipe(
            Effect.mapError(
              (cause) =>
                new GetSessionProfileUpstreamError({
                  cause,
                  message: getErrorMessage(cause),
                  signed,
                  uuid,
                })
            ),
            Effect.flatMap((response) =>
              Effect.gen(function* handleSessionProfileResponse() {
                if (response.status === 404 || response.status === 204) {
                  return yield* Effect.fail(
                    new PlayerNotFoundError({ nameOrUuid: uuid })
                  );
                }

                if (response.status < 200 || response.status >= 300) {
                  return yield* Effect.fail(
                    new GetSessionProfileUpstreamError({
                      cause: statusMessage(response),
                      message: statusMessage(response),
                      signed,
                      statusCode: response.status,
                      uuid,
                    })
                  );
                }

                return yield* response.json.pipe(
                  Effect.mapError(
                    (cause) =>
                      new GetSessionProfileUpstreamError({
                        cause,
                        message: getErrorMessage(cause),
                        signed,
                        uuid,
                      })
                  )
                );
              })
            ),
            Effect.flatMap((payload) =>
              Schema.decodeUnknownEffect(MojangSessionProfileSchema)(
                payload
              ).pipe(
                Effect.mapError(
                  (cause) =>
                    new DecodeSessionProfileResponseError({
                      cause,
                      message: getErrorMessage(cause),
                      signed,
                      uuid,
                    })
                )
              )
            )
          ),
      getTexture: (textureId) =>
        client.get(`${TEXTURES_BASE_URL}/texture/${textureId}`).pipe(
          Effect.mapError(
            (cause) =>
              new GetTextureUpstreamError({
                cause,
                message: getErrorMessage(cause),
                textureId,
              })
          ),
          Effect.flatMap((response) =>
            Effect.gen(function* handleTextureResponse() {
              if (response.status === 404) {
                return yield* Effect.fail(
                  new TextureNotFoundError({ textureId })
                );
              }

              if (response.status < 200 || response.status >= 300) {
                return yield* Effect.fail(
                  new GetTextureUpstreamError({
                    cause: statusMessage(response),
                    message: statusMessage(response),
                    statusCode: response.status,
                    textureId,
                  })
                );
              }

              const body = yield* response.arrayBuffer.pipe(
                Effect.mapError(
                  (cause) =>
                    new GetTextureUpstreamError({
                      cause,
                      message: getErrorMessage(cause),
                      textureId,
                    })
                )
              );

              return {
                body,
                contentType:
                  headerOrNull(response, "content-type") ?? "image/png",
                etag: headerOrNull(response, "etag"),
                lastModified: headerOrNull(response, "last-modified"),
              };
            })
          )
        ),
      getVersionManifest: () =>
        client
          .get(`${PISTON_META_BASE_URL}/mc/game/version_manifest_v2.json`)
          .pipe(
            Effect.mapError(
              (cause) =>
                new GetVersionManifestUpstreamError({
                  cause,
                  message: getErrorMessage(cause),
                })
            ),
            Effect.flatMap((response) => {
              if (response.status < 200 || response.status >= 300) {
                return Effect.fail(
                  new GetVersionManifestUpstreamError({
                    cause: statusMessage(response),
                    message: statusMessage(response),
                    statusCode: response.status,
                  })
                );
              }

              return response.json.pipe(
                Effect.mapError(
                  (cause) =>
                    new GetVersionManifestUpstreamError({
                      cause,
                      message: getErrorMessage(cause),
                    })
                )
              );
            }),
            Effect.flatMap((payload) =>
              Schema.decodeUnknownEffect(PistonVersionManifestSchema)(
                payload
              ).pipe(
                Effect.mapError(
                  (cause) =>
                    new DecodeVersionManifestResponseError({
                      cause,
                      message: getErrorMessage(cause),
                    })
                )
              )
            )
          ),
      getVersionMetadata: (versionId, url) =>
        Effect.try({
          catch: (cause) =>
            new GetVersionMetadataUpstreamError({
              cause,
              message: getErrorMessage(cause),
              versionId,
            }),
          try: () => new URL(url),
        }).pipe(
          Effect.flatMap((metadataUrl) => {
            if (!isOfficialPistonMetadataUrl(metadataUrl)) {
              return Effect.fail(
                new GetVersionMetadataUpstreamError({
                  cause: url,
                  message: "Version metadata URL is not an official Piston URL",
                  versionId,
                })
              );
            }

            return client.get(metadataUrl).pipe(
              Effect.mapError(
                (cause) =>
                  new GetVersionMetadataUpstreamError({
                    cause,
                    message: getErrorMessage(cause),
                    versionId,
                  })
              )
            );
          }),
          Effect.flatMap((response) => {
            if (response.status < 200 || response.status >= 300) {
              return Effect.fail(
                new GetVersionMetadataUpstreamError({
                  cause: statusMessage(response),
                  message: statusMessage(response),
                  statusCode: response.status,
                  versionId,
                })
              );
            }

            return response.json.pipe(
              Effect.mapError(
                (cause) =>
                  new GetVersionMetadataUpstreamError({
                    cause,
                    message: getErrorMessage(cause),
                    versionId,
                  })
              )
            );
          }),
          Effect.flatMap((payload) =>
            Schema.decodeUnknownEffect(PistonVersionMetadataSchema)(
              payload
            ).pipe(
              Effect.mapError(
                (cause) =>
                  new DecodeVersionMetadataResponseError({
                    cause,
                    message: getErrorMessage(cause),
                    versionId,
                  })
              )
            )
          )
        ),
      resolveUsername: (username) =>
        client
          .get(
            `${MINECRAFT_SERVICES_BASE_URL}/minecraft/profile/lookup/name/${encodeURIComponent(
              username
            )}`
          )
          .pipe(
            Effect.mapError(
              (cause) =>
                new ResolveUsernameUpstreamError({
                  cause,
                  message: getErrorMessage(cause),
                  username,
                })
            ),
            Effect.flatMap((response) =>
              Effect.gen(function* handleUsernameResponse() {
                if (response.status === 404 || response.status === 204) {
                  return yield* Effect.fail(
                    new PlayerNotFoundError({ nameOrUuid: username })
                  );
                }

                if (response.status < 200 || response.status >= 300) {
                  return yield* Effect.fail(
                    new ResolveUsernameUpstreamError({
                      cause: statusMessage(response),
                      message: statusMessage(response),
                      statusCode: response.status,
                      username,
                    })
                  );
                }

                return yield* response.json.pipe(
                  Effect.mapError(
                    (cause) =>
                      new ResolveUsernameUpstreamError({
                        cause,
                        message: getErrorMessage(cause),
                        username,
                      })
                  )
                );
              })
            ),
            Effect.flatMap((payload) =>
              Schema.decodeUnknownEffect(MojangProfileSchema)(payload).pipe(
                Effect.mapError(
                  (cause) =>
                    new DecodeUsernameLookupResponseError({
                      cause,
                      message: getErrorMessage(cause),
                      username,
                    })
                )
              )
            )
          ),
      resolveUsernames: (usernames) => {
        const request = HttpClientRequest.post(
          `${MINECRAFT_SERVICES_BASE_URL}/minecraft/profile/lookup/bulk/byname`,
          {
            headers: {
              "content-type": "application/json",
            },
          }
        ).pipe(HttpClientRequest.bodyJsonUnsafe(usernames));

        return client.execute(request).pipe(
          Effect.mapError(
            (cause) =>
              new ResolveUsernamesUpstreamError({
                cause,
                message: getErrorMessage(cause),
                usernames: [...usernames],
              })
          ),
          Effect.flatMap((response) => {
            if (response.status < 200 || response.status >= 300) {
              return Effect.fail(
                new ResolveUsernamesUpstreamError({
                  cause: statusMessage(response),
                  message: statusMessage(response),
                  statusCode: response.status,
                  usernames: [...usernames],
                })
              );
            }

            return response.json.pipe(
              Effect.mapError(
                (cause) =>
                  new ResolveUsernamesUpstreamError({
                    cause,
                    message: getErrorMessage(cause),
                    usernames: [...usernames],
                  })
              )
            );
          }),
          Effect.flatMap((payload) =>
            Schema.decodeUnknownEffect(MojangProfileListSchema)(payload).pipe(
              Effect.mapError(
                (cause) =>
                  new DecodeUsernamesLookupResponseError({
                    cause,
                    message: getErrorMessage(cause),
                    usernames: [...usernames],
                  })
              )
            )
          )
        );
      },
    };
  })
);
