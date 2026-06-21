import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class DecodeUsernamesLookupResponseError extends Schema.TaggedErrorClass<DecodeUsernamesLookupResponseError>()(
  "DecodeUsernamesLookupResponseError",
  {
    ...CauseFields,
    usernames: Schema.Array(Schema.String),
  }
) {}
