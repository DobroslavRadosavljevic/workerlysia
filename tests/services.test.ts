import { expect, layer } from "@effect/vitest";
import { Effect } from "effect";

import {
  TaskService,
  TaskServiceLive,
} from "../src/modules/tasks/services/task/service";

layer(TaskServiceLive)("TaskService", (it) => {
  it.effect("filters completed tasks inside an Effect test layer", () =>
    Effect.gen(function* filterCompletedTasks() {
      const tasks = yield* TaskService;
      const completed = yield* tasks.list("true");

      expect(completed).toHaveLength(1);
      expect(completed[0]?.completed).toBe(true);
      expect(completed[0]?.slug).toBe("cloudflare-workers");
    })
  );

  it.effect("returns generated task details", () =>
    Effect.gen(function* getGeneratedTaskDetails() {
      const tasks = yield* TaskService;
      const task = yield* tasks.get("effect-test");

      expect(task).toMatchObject({
        completed: false,
        name: "my task",
        slug: "effect-test",
      });
    })
  );
});
