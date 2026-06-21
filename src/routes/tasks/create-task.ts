import { Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../effect/app";
import { TaskSchema } from "../../schemas/task";
import { TaskService } from "../../services/tasks";

export const createTaskRoute = new Elysia().post(
  "/tasks",
  () => RouteRuntime.runPromise(TaskService.use((tasks) => tasks.create())),
  {
    body: Schema.toStandardSchemaV1(TaskSchema),
    detail: {
      summary: "Create a new Task",
      tags: ["Tasks"],
    },
    response: {
      200: Schema.toStandardSchemaV1(TaskSchema),
    },
  }
);
