import { Schema } from "effect";

import { CauseFields } from "./cause";

export class JsonParseError extends Schema.TaggedErrorClass<JsonParseError>()(
  "JsonParseError",
  CauseFields
) {}
