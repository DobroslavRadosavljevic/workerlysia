import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class GetVersionManifestUpstreamError extends Schema.TaggedErrorClass<GetVersionManifestUpstreamError>()(
  "GetVersionManifestUpstreamError",
  {
    ...CauseFields,
    statusCode: Schema.optionalKey(Schema.Number),
  }
) {}
