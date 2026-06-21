import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class ReadMinecraftCacheError extends Schema.TaggedErrorClass<ReadMinecraftCacheError>()(
  "ReadMinecraftCacheError",
  {
    ...CauseFields,
    key: Schema.String,
  }
) {}
