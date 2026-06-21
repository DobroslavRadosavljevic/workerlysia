import { Schema } from "effect";

import { CauseFields } from "../../shared/errors/cause";

export class DecodeMinecraftCacheEntryError extends Schema.TaggedErrorClass<DecodeMinecraftCacheEntryError>()(
  "DecodeMinecraftCacheEntryError",
  {
    ...CauseFields,
    key: Schema.String,
  }
) {}
