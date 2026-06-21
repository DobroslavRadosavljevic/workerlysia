export const sessionProfileCacheKey = (uuid: string, signed: boolean): string =>
  `minecraft:session-profile:${uuid}:${signed ? "signed" : "unsigned"}`;
