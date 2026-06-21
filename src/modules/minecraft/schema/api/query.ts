import { Schema } from "effect";

export const SignedProfileQuerySchema = Schema.Struct({
  signed: Schema.optionalKey(
    Schema.Literals(["true", "false"] as const).annotate({
      default: "false",
      description: "Request a signed Mojang texture property",
    })
  ),
});

export type SignedProfileQuery = typeof SignedProfileQuerySchema.Type;
