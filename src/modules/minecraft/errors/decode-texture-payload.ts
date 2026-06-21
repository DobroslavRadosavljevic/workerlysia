import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class DecodeTexturePayloadError extends Schema.TaggedErrorClass<DecodeTexturePayloadError>()(
  "DecodeTexturePayloadError",
  {
    ...CauseFields,
    uuid: Schema.String,
  }
) {}
