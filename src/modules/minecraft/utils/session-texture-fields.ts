import { Effect } from "effect";

import type { DecodeTexturePayloadError } from "../errors/decode-texture-payload";
import type { MojangSessionProfile } from "../schema/upstream";
import type { NormalizedTextures } from "../types";
import { parseSessionTextures } from "./parse-session-textures";

export const sessionTextureFields = (
  profile: MojangSessionProfile
): Effect.Effect<NormalizedTextures, DecodeTexturePayloadError> => {
  const texturesProperty = profile.properties.find(
    (property) => property.name === "textures"
  );

  if (!texturesProperty) {
    return Effect.succeed({} as NormalizedTextures);
  }

  return parseSessionTextures(profile.id, texturesProperty.value);
};
