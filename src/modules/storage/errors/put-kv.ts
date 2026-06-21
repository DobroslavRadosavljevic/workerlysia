import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class PutKvError extends Schema.TaggedErrorClass<PutKvError>()(
  "PutKvError",
  {
    ...CauseFields,
    key: Schema.String,
  }
) {}
