import { Effect } from "effect";

import { JsonParseError } from "./errors/json-parse";
import { JsonStringifyError } from "./errors/json-stringify";

export const getErrorMessage = (cause: unknown): string =>
  cause instanceof Error ? cause.message : "Unknown error";

export const recoverEffect = Effect.catch;
export const recoverTagged = Effect.catchTag;

export const parseJson = <A = unknown>(input: string) =>
  Effect.try({
    catch: (cause) =>
      new JsonParseError({
        cause,
        message: getErrorMessage(cause),
      }),
    try: () => JSON.parse(input) as A,
  });

export const stringifyJson = (value: unknown) =>
  Effect.try({
    catch: (cause) =>
      new JsonStringifyError({
        cause,
        message: getErrorMessage(cause),
      }),
    try: () => JSON.stringify(value) ?? "null",
  });
