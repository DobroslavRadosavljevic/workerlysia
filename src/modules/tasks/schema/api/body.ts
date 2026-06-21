import { Schema } from "effect";

import {
  TaskCompletedSchema,
  TaskDateStringSchema,
  TaskDescriptionSchema,
  TaskNameSchema,
  TaskSlugSchema,
} from "./shared";

export const CreateTaskBodySchema = Schema.Struct({
  completed: TaskCompletedSchema,
  description: Schema.optionalKey(TaskDescriptionSchema),
  due_date: TaskDateStringSchema,
  name: TaskNameSchema,
  slug: TaskSlugSchema,
});

export type CreateTaskBody = typeof CreateTaskBodySchema.Type;
