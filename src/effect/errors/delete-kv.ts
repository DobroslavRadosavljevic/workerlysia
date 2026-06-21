import { Schema } from "effect";

import { CauseFields } from "./cause";

export class DeleteKvError extends Schema.TaggedErrorClass<DeleteKvError>()(
  "DeleteKvError",
  {
    ...CauseFields,
    key: Schema.String,
  }
) {}
