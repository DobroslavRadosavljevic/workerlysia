import type { MojangTextureEntry, NormalizedTexture } from "../types";
import { textureIdFromOfficialUrl } from "./texture-id-from-official-url";

export const toProxyTexture = (
  texture: MojangTextureEntry
): NormalizedTexture | undefined => {
  if (!texture) {
    return undefined;
  }

  const textureId = textureIdFromOfficialUrl(texture.url);

  return {
    ...(texture.metadata?.model ? { model: texture.metadata.model } : {}),
    sourceUrl: texture.url,
    textureId,
    url: `/minecraft/textures/${textureId}`,
  };
};
