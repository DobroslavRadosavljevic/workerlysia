import { Schema } from "effect";

export const CacheStatusSchema = Schema.Literals([
  "hit",
  "miss",
  "skipped",
] as const);

export const UsernameSchema = Schema.String.check(
  Schema.isPattern(/^[A-Za-z0-9_]{3,16}$/u)
).annotate({
  description: "Minecraft Java username",
  examples: ["Notch", "jeb_"],
});

export const UuidDashlessSchema = Schema.String.check(
  Schema.isPattern(/^[0-9a-fA-F]{32}$/u)
).annotate({
  description: "Dashless Minecraft UUID",
  examples: ["069a79f444e94726a5befca90e38aaf5"],
});

export const UuidDashedSchema = Schema.String.check(
  Schema.isPattern(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/u
  )
).annotate({
  description: "Dashed Minecraft UUID",
  examples: ["069a79f4-44e9-4726-a5be-fca90e38aaf5"],
});

export const NameOrUuidSchema = Schema.String.check(
  Schema.isPattern(
    /^(?:[A-Za-z0-9_]{3,16}|[0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/u
  )
).annotate({
  description: "Minecraft Java username or UUID",
  examples: ["Notch", "069a79f444e94726a5befca90e38aaf5"],
});

export const TextureIdSchema = Schema.String.check(
  Schema.isPattern(/^[0-9a-fA-F]{64}$/u)
).annotate({
  description: "Minecraft texture hash from textures.minecraft.net",
});

export const VersionIdSchema = Schema.String.check(
  Schema.isPattern(/^[ A-Za-z0-9_.-]+$/u)
).annotate({
  description: "Minecraft version id from Piston metadata",
  examples: ["1.21.6", "25w21a", "1.14.2 Pre-Release 4"],
});
