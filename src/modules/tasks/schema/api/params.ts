import { Schema } from "effect";

import { TaskSlugSchema } from "./shared";

export const TaskParamsSchema = Schema.Struct({
  taskSlug: TaskSlugSchema.annotate({
    description: "Task slug",
  }),
});

export type TaskParams = typeof TaskParamsSchema.Type;
