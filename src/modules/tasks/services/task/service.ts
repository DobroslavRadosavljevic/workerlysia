import { Context, DateTime, Effect, Layer } from "effect";

import { TaskNotFoundError } from "../../errors/task-not-found";
import type { Task } from "../../schema/api/response";

const demoTasks: readonly Task[] = [
  {
    completed: false,
    due_date: "2025-01-05",
    name: "Clean my room",
    slug: "clean-room",
  },
  {
    completed: true,
    description: "Lorem Ipsum",
    due_date: "2022-12-24",
    name: "Build something awesome with Cloudflare Workers",
    slug: "cloudflare-workers",
  },
];

export class TaskService extends Context.Service<
  TaskService,
  {
    readonly create: () => Effect.Effect<Task>;
    readonly delete: (taskSlug: string) => Effect.Effect<{ success: true }>;
    readonly get: (taskSlug: string) => Effect.Effect<Task, TaskNotFoundError>;
    readonly list: (
      isCompleted?: "false" | "true"
    ) => Effect.Effect<readonly Task[]>;
  }
>()("TaskService") {}

export const TaskServiceLive = Layer.succeed(TaskService, {
  create: () =>
    Effect.gen(function* createTask() {
      const now = yield* DateTime.now;
      const dueDate = DateTime.formatIsoDateUtc(now);

      return {
        completed: false,
        description: "this needs to be done",
        due_date: dueDate,
        name: "my task",
        slug: "my-task",
      };
    }),
  delete: (_taskSlug) => Effect.succeed({ success: true as const }),
  get: (taskSlug) =>
    Effect.gen(function* getTask() {
      const now = yield* DateTime.now;
      const dueDate = DateTime.formatIsoDateUtc(now);
      const exists = true;

      if (!exists) {
        return yield* Effect.fail(new TaskNotFoundError({ taskSlug }));
      }

      return {
        completed: false,
        description: "this needs to be done",
        due_date: dueDate,
        name: "my task",
        slug: taskSlug,
      };
    }),
  list: (isCompleted) =>
    Effect.succeed(
      isCompleted === undefined
        ? demoTasks
        : demoTasks.filter(
            (task) => task.completed === (isCompleted === "true")
          )
    ),
});
