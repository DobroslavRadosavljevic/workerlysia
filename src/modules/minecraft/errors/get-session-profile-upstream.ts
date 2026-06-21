import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class GetSessionProfileUpstreamError extends Schema.TaggedErrorClass<GetSessionProfileUpstreamError>()(
  "GetSessionProfileUpstreamError",
  {
    ...CauseFields,
    signed: Schema.Boolean,
    statusCode: Schema.optionalKey(Schema.Number),
    uuid: Schema.String,
  }
) {}
