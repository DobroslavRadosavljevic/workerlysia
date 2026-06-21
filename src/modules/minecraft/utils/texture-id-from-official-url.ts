export const textureIdFromOfficialUrl = (url: string): string =>
  new URL(url).pathname.replace("/texture/", "").toLowerCase();
