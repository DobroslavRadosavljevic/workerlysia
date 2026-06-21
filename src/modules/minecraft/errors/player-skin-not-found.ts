import { Schema } from "effect";

export class PlayerSkinNotFoundError extends Schema.TaggedErrorClass<PlayerSkinNotFoundError>()(
  "PlayerSkinNotFoundError",
  {
    uuid: Schema.String,
  }
) {}
