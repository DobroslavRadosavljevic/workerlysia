import { Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../effect/app";
import { SuccessResponseSchema } from "../../schemas/common";
import { TaskParamsSchema } from "../../schemas/task";
import { TaskService } from "../../services/tasks";

export const deleteTaskRoute = new Elysia().delete(
  "/tasks/:taskSlug",
  ({ params }) =>
    RouteRuntime.runPromise(
      TaskService.use((tasks) => tasks.delete(params.taskSlug))
    ),
  {
    detail: {
      summary: "Delete a Task",
      tags: ["Tasks"],
    },
    params: Schema.toStandardSchemaV1(TaskParamsSchema),
    response: {
      200: Schema.toStandardSchemaV1(SuccessResponseSchema),
    },
  }
);
