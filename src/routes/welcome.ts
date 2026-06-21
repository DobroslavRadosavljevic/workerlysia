import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../effect/app";

const WelcomeResponseSchema = Schema.Struct({
  docs: Schema.String,
  message: Schema.String,
  version: Schema.String,
});

export const welcomeRoute = new Elysia().get(
  "/",
  () =>
    RouteRuntime.runPromise(
      Effect.succeed({
        docs: "/docs",
        message: "Welcome to Workerlysia API",
        version: "1.0.0",
      })
    ),
  {
    detail: {
      summary: "Welcome",
      tags: ["General"],
    },
    response: {
      200: Schema.toStandardSchemaV1(WelcomeResponseSchema),
    },
  }
);
