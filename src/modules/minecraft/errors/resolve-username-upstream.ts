import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class ResolveUsernameUpstreamError extends Schema.TaggedErrorClass<ResolveUsernameUpstreamError>()(
  "ResolveUsernameUpstreamError",
  {
    ...CauseFields,
    statusCode: Schema.optionalKey(Schema.Number),
    username: Schema.String,
  }
) {}
