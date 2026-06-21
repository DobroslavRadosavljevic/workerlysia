import { Schema } from "effect";

export class VersionNotFoundError extends Schema.TaggedErrorClass<VersionNotFoundError>()(
  "VersionNotFoundError",
  {
    versionId: Schema.String,
  }
) {}
