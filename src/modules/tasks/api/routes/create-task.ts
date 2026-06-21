import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import { CreateTaskBodySchema } from "../../schema/api/body";
import { TaskSchema } from "../../schema/api/response";
import { TaskService } from "../../services/task/service";

export const createTaskRoute = new Elysia().post(
  "/tasks",
  ({ status }) =>
    RouteRuntime.runPromise(
      TaskService.use((tasks) => tasks.create()).pipe(
        Effect.map((result) => status(200, result))
      )
    ),
  {
    body: Schema.toStandardSchemaV1(CreateTaskBodySchema),
    detail: {
      summary: "Create a new Task",
      tags: ["Tasks"],
    },
    response: {
      200: Schema.toStandardSchemaV1(TaskSchema),
    },
  }
);
