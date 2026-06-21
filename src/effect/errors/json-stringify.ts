import { Schema } from "effect";

import { CauseFields } from "./cause";

export class JsonStringifyError extends Schema.TaggedErrorClass<JsonStringifyError>()(
  "JsonStringifyError",
  CauseFields
) {}
