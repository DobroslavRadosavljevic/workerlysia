import { Schema } from "effect";

export class TextureNotFoundError extends Schema.TaggedErrorClass<TextureNotFoundError>()(
  "TextureNotFoundError",
  {
    textureId: Schema.String,
  }
) {}
