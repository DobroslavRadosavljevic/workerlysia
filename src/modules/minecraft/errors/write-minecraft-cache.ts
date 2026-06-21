import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class WriteMinecraftCacheError extends Schema.TaggedErrorClass<WriteMinecraftCacheError>()(
  "WriteMinecraftCacheError",
  {
    ...CauseFields,
    key: Schema.String,
  }
) {}
