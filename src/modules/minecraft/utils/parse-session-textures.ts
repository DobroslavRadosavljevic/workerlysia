import { Effect, Schema } from "effect";

import { getErrorMessage } from "../../../effect/runtime";
import { DecodeTexturePayloadError } from "../errors/decode-texture-payload";
import { MojangTexturePayloadSchema } from "../schema/upstream";
import type { NormalizedTextures } from "../types";
import { toProxyTexture } from "./to-proxy-texture";

export const parseSessionTextures = (
  uuid: string,
  value: string
): Effect.Effect<NormalizedTextures, DecodeTexturePayloadError> =>
  Schema.decodeUnknownEffect(Schema.StringFromBase64)(value).pipe(
    Effect.flatMap((json) =>
      Schema.decodeUnknownEffect(
        Schema.fromJsonString(MojangTexturePayloadSchema)
      )(json)
    ),
    Effect.map((payload) => ({
      cape: toProxyTexture(payload.textures.CAPE),
      skin: toProxyTexture(payload.textures.SKIN),
    })),
    Effect.mapError(
      (cause) =>
        new DecodeTexturePayloadError({
          cause,
          message: getErrorMessage(cause),
          uuid,
        })
    )
  );
