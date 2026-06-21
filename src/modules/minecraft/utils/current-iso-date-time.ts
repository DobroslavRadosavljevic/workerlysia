import { DateTime, Effect } from "effect";

export const currentIsoDateTime = DateTime.now.pipe(
  Effect.map((now) => DateTime.formatIso(now))
);
