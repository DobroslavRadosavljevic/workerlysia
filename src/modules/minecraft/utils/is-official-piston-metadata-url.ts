export const isOfficialPistonMetadataUrl = (url: URL): boolean =>
  url.protocol === "https:" && url.hostname === "piston-meta.mojang.com";
