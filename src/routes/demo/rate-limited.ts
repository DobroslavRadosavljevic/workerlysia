import { Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../effect/app";
import { rateLimitPlugin } from "../../plugins/rate-limit";
import {
  ErrorMessageResponseSchema,
  RateLimitHeadersSchema,
} from "../../schemas/common";
import { RateLimitedDemoResponseSchema } from "../../schemas/demo";
import { DemoService } from "../../services/demo";

export const rateLimitedRoutes = new Elysia({ prefix: "/demo" })
  .use(rateLimitPlugin())
  .get(
    "/rate-limited",
    () =>
      RouteRuntime.runPromise(
        DemoService.use((demo) =>
          demo.rateLimited("This endpoint is rate limited")
        )
      ),
    {
      detail: {
        summary: "Rate limited endpoint (5 req/min)",
        tags: ["Demo"],
      },
      headers: Schema.toStandardSchemaV1(RateLimitHeadersSchema),
      // 5 requests per minute
      rateLimit: { max: 5, window: 60 },
      response: {
        200: Schema.toStandardSchemaV1(RateLimitedDemoResponseSchema),
        429: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      },
    }
  )
  .get(
    "/rate-limited-strict",
    () =>
      RouteRuntime.runPromise(
        DemoService.use((demo) =>
          demo.rateLimited("This endpoint has strict rate limiting")
        )
      ),
    {
      detail: {
        summary: "Strictly rate limited endpoint (3 req/60s)",
        tags: ["Demo"],
      },
      headers: Schema.toStandardSchemaV1(RateLimitHeadersSchema),
      // 3 requests per 60 seconds (KV minimum TTL)
      rateLimit: { max: 3, window: 60 },
      response: {
        200: Schema.toStandardSchemaV1(RateLimitedDemoResponseSchema),
        429: Schema.toStandardSchemaV1(ErrorMessageResponseSchema),
      },
    }
  )
  .get(
    "/no-limit",
    () =>
      RouteRuntime.runPromise(
        DemoService.use((demo) =>
          demo.rateLimited("This endpoint has no rate limit")
        )
      ),
    {
      detail: {
        summary: "No rate limit endpoint",
        tags: ["Demo"],
      },
      response: {
        200: Schema.toStandardSchemaV1(RateLimitedDemoResponseSchema),
      },
    }
  );
