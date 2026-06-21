import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class ResolveUsernamesUpstreamError extends Schema.TaggedErrorClass<ResolveUsernamesUpstreamError>()(
  "ResolveUsernamesUpstreamError",
  {
    ...CauseFields,
    statusCode: Schema.optionalKey(Schema.Number),
    usernames: Schema.Array(Schema.String),
  }
) {}
