import { Schema } from "effect";

import {
  TaskCompletedSchema,
  TaskDateStringSchema,
  TaskDescriptionSchema,
  TaskNameSchema,
  TaskSlugSchema,
} from "./shared";

export const TaskSchema = Schema.Struct({
  completed: TaskCompletedSchema,
  description: Schema.optionalKey(TaskDescriptionSchema),
  due_date: TaskDateStringSchema,
  name: TaskNameSchema,
  slug: TaskSlugSchema,
});

export const TaskListSchema = Schema.Array(TaskSchema);

export type Task = typeof TaskSchema.Type;
