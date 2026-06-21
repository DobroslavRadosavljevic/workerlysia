import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class DeleteKvError extends Schema.TaggedErrorClass<DeleteKvError>()(
  "DeleteKvError",
  {
    ...CauseFields,
    key: Schema.String,
  }
) {}
