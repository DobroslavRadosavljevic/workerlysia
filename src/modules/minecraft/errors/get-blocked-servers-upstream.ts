import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class GetBlockedServersUpstreamError extends Schema.TaggedErrorClass<GetBlockedServersUpstreamError>()(
  "GetBlockedServersUpstreamError",
  {
    ...CauseFields,
    statusCode: Schema.optionalKey(Schema.Number),
  }
) {}
