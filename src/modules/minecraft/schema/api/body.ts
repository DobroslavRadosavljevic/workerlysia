import { Schema } from "effect";

import { UsernameSchema } from "./shared";

export const ResolvePlayersBodySchema = Schema.Struct({
  usernames: Schema.Array(UsernameSchema).check(
    Schema.isMinLength(1),
    Schema.isMaxLength(10)
  ),
});

export type ResolvePlayersBody = typeof ResolvePlayersBodySchema.Type;
