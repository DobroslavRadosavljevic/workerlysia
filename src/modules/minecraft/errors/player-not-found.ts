import { Schema } from "effect";

export class PlayerNotFoundError extends Schema.TaggedErrorClass<PlayerNotFoundError>()(
  "PlayerNotFoundError",
  {
    nameOrUuid: Schema.String,
  }
) {}
