import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class DecodeUsernameLookupResponseError extends Schema.TaggedErrorClass<DecodeUsernameLookupResponseError>()(
  "DecodeUsernameLookupResponseError",
  {
    ...CauseFields,
    username: Schema.String,
  }
) {}
