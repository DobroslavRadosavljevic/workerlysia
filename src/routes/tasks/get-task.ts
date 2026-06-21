import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../effect/app";
import { ErrorResponseSchema } from "../../schemas/common";
import { TaskParamsSchema, TaskSchema } from "../../schemas/task";
import { TaskService } from "../../services/tasks";

export const getTaskRoute = new Elysia().get(
  "/tasks/:taskSlug",
  ({ params, status }) =>
    RouteRuntime.runPromise(
      TaskService.use((tasks) => tasks.get(params.taskSlug)).pipe(
        Effect.map((result) => status(200, result)),
        Effect.catchTags({
          TaskNotFoundError: () =>
            Effect.succeed(
              status(404, {
                error: "Object not found",
                success: false,
              })
            ),
        })
      )
    ),
  {
    detail: {
      summary: "Get a single Task by slug",
      tags: ["Tasks"],
    },
    params: Schema.toStandardSchemaV1(TaskParamsSchema),
    response: {
      200: Schema.toStandardSchemaV1(TaskSchema),
      404: Schema.toStandardSchemaV1(ErrorResponseSchema),
    },
  }
);
