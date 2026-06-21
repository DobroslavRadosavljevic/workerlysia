export const usernameCacheKey = (username: string): string =>
  `minecraft:username:${username.toLowerCase()}`;
