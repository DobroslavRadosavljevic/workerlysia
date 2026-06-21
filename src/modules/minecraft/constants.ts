export const MINECRAFT_SERVICES_BASE_URL = "https://api.minecraftservices.com";
export const SESSION_SERVER_BASE_URL = "https://sessionserver.mojang.com";
export const TEXTURES_BASE_URL = "https://textures.minecraft.net";
export const PISTON_META_BASE_URL = "https://piston-meta.mojang.com";

export const USERNAME_CACHE_TTL_SECONDS = 86_400;
export const SESSION_PROFILE_CACHE_TTL_SECONDS = 3600;
export const BLOCKED_SERVERS_CACHE_TTL_SECONDS = 300;
export const VERSION_MANIFEST_CACHE_TTL_SECONDS = 120;
export const VERSION_METADATA_CACHE_TTL_SECONDS = 86_400;

export const BLOCKED_SERVERS_CACHE_KEY = "minecraft:blocked-servers";
export const VERSION_MANIFEST_CACHE_KEY = "minecraft:piston:version-manifest";

export const DASHLESS_UUID_PATTERN = /^[0-9a-fA-F]{32}$/u;
export const DASHED_UUID_PATTERN =
  /^(?:[0-9a-fA-F]{8})-(?:[0-9a-fA-F]{4})-(?:[0-9a-fA-F]{4})-(?:[0-9a-fA-F]{4})-(?:[0-9a-fA-F]{12})$/u;
