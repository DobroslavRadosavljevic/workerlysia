import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import { SuccessResponseSchema } from "../../../shared/schema/api/response";
import { TaskParamsSchema } from "../../schema/api/params";
import { TaskService } from "../../services/task/service";

export const deleteTaskRoute = new Elysia().delete(
  "/tasks/:taskSlug",
  ({ params, status }) =>
    RouteRuntime.runPromise(
      TaskService.use((tasks) => tasks.delete(params.taskSlug)).pipe(
        Effect.map((result) => status(200, result))
      )
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
