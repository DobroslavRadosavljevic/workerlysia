import { openapi } from "@elysiajs/openapi";
import { Schema } from "effect";
import { Elysia } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";

import { welcomeRoute } from "./modules/general/api/routes/welcome";
import { kvRoutes } from "./modules/storage/api/routes/kv";
import { createTaskRoute } from "./modules/tasks/api/routes/create-task";
import { deleteTaskRoute } from "./modules/tasks/api/routes/delete-task";
import { getTaskRoute } from "./modules/tasks/api/routes/get-task";
import { listTasksRoute } from "./modules/tasks/api/routes/list-tasks";

const app = new Elysia({ adapter: CloudflareAdapter })
  .use(
    openapi({
      documentation: {
        info: {
          description:
            "A modern starter kit for building type-safe APIs with Elysia on Cloudflare Workers",
          license: {
            name: "MIT",
          },
          title: "Workerlysia API",
          version: "1.0.0",
        },
      },
      mapJsonSchema: {
        effect: (schema: Schema.Top) =>
          Schema.toJsonSchemaDocument(schema).schema,
      },
      path: "/docs",
      specPath: "/docs/openapi.json",
    })
  )
  .use(welcomeRoute)
  .use(listTasksRoute)
  .use(createTaskRoute)
  .use(getTaskRoute)
  .use(deleteTaskRoute)
  .use(kvRoutes)
  .compile();

export type App = typeof app;

export default app;
