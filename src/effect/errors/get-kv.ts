import { Schema } from "effect";

import { CauseFields } from "./cause";

export class GetKvError extends Schema.TaggedErrorClass<GetKvError>()(
  "GetKvError",
  {
    ...CauseFields,
    key: Schema.String,
  }
) {}
