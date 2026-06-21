import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class GetVersionMetadataUpstreamError extends Schema.TaggedErrorClass<GetVersionMetadataUpstreamError>()(
  "GetVersionMetadataUpstreamError",
  {
    ...CauseFields,
    statusCode: Schema.optionalKey(Schema.Number),
    versionId: Schema.String,
  }
) {}
