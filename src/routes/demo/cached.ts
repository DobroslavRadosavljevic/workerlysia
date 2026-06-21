import { Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../effect/app";
import { cachePlugin } from "../../plugins/cache";
import { CachedDemoResponseSchema } from "../../schemas/demo";
import { DemoService } from "../../services/demo";

export const cachedRoutes = new Elysia({ prefix: "/demo" })
  .use(cachePlugin())
  .get(
    "/cached",
    () =>
      RouteRuntime.runPromise(
        DemoService.use((demo) => demo.cached("This response is cached"))
      ),
    {
      // 60 second TTL (KV minimum)
      cache: 60,
      detail: {
        summary: "Cached endpoint (60s TTL)",
        tags: ["Demo"],
      },
      response: {
        200: Schema.toStandardSchemaV1(CachedDemoResponseSchema),
      },
    }
  )
  .get(
    "/cached-long",
    () =>
      RouteRuntime.runPromise(
        DemoService.use((demo) =>
          demo.cached("This response is cached for longer")
        )
      ),
    {
      // 5 minute TTL
      cache: 300,
      detail: {
        summary: "Cached endpoint (5min TTL)",
        tags: ["Demo"],
      },
      response: {
        200: Schema.toStandardSchemaV1(CachedDemoResponseSchema),
      },
    }
  )
  .get(
    "/not-cached",
    () =>
      RouteRuntime.runPromise(
        DemoService.use((demo) => demo.cached("This response is NOT cached"))
      ),
    {
      detail: {
        summary: "Non-cached endpoint",
        tags: ["Demo"],
      },
      response: {
        200: Schema.toStandardSchemaV1(CachedDemoResponseSchema),
      },
    }
  );
