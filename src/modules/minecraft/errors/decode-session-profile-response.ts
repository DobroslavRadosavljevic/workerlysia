import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class DecodeSessionProfileResponseError extends Schema.TaggedErrorClass<DecodeSessionProfileResponseError>()(
  "DecodeSessionProfileResponseError",
  {
    ...CauseFields,
    signed: Schema.Boolean,
    uuid: Schema.String,
  }
) {}
