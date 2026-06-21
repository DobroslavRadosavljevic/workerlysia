import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class GetTextureUpstreamError extends Schema.TaggedErrorClass<GetTextureUpstreamError>()(
  "GetTextureUpstreamError",
  {
    ...CauseFields,
    statusCode: Schema.optionalKey(Schema.Number),
    textureId: Schema.String,
  }
) {}
