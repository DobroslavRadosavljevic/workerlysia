import { Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../effect/app";
import { ListTasksQuerySchema, TaskListSchema } from "../../schemas/task";
import { TaskService } from "../../services/tasks";

export const listTasksRoute = new Elysia().get(
  "/tasks",
  ({ query }) =>
    RouteRuntime.runPromise(
      TaskService.use((tasks) => tasks.list(query.isCompleted))
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
