import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class DecodeVersionMetadataResponseError extends Schema.TaggedErrorClass<DecodeVersionMetadataResponseError>()(
  "DecodeVersionMetadataResponseError",
  {
    ...CauseFields,
    versionId: Schema.String,
  }
) {}
