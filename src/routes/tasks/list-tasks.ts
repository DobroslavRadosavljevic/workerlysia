import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../effect/app";
import { ListTasksQuerySchema, TaskListSchema } from "../../schemas/task";
import { TaskService } from "../../services/tasks";

export const listTasksRoute = new Elysia().get(
  "/tasks",
  ({ query, status }) =>
    RouteRuntime.runPromise(
      TaskService.use((tasks) => tasks.list(query.isCompleted)).pipe(
        Effect.map((result) => status(200, result))
      )
    ),
  {
    detail: {
      summary: "List Tasks",
      tags: ["Tasks"],
    },
    query: Schema.toStandardSchemaV1(ListTasksQuerySchema),
    response: {
      200: Schema.toStandardSchemaV1(TaskListSchema),
    },
  }
);
