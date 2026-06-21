import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class DecodeVersionManifestResponseError extends Schema.TaggedErrorClass<DecodeVersionManifestResponseError>()(
  "DecodeVersionManifestResponseError",
  {
    ...CauseFields,
  }
) {}
