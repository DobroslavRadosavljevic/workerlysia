import { Schema } from "effect";

export class TaskNotFoundError extends Schema.TaggedErrorClass<TaskNotFoundError>()(
  "TaskNotFoundError",
  {
    taskSlug: Schema.String,
  }
) {}
