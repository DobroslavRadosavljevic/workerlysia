import { Schema } from "effect";

const DateString = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/u)
).annotate({
  examples: ["2025-01-05"],
  format: "date",
});

const PageNumberFromString = Schema.NumberFromString.check(
  Schema.isInt(),
  Schema.isGreaterThanOrEqualTo(1)
);

export const TaskSchema = Schema.Struct({
  completed: Schema.Boolean.annotate({ default: false }),
  description: Schema.optionalKey(Schema.String),
  due_date: DateString,
  name: Schema.String.annotate({ examples: ["lorem"] }),
  slug: Schema.String,
});

export const TaskParamsSchema = Schema.Struct({
  taskSlug: Schema.String.annotate({
    description: "Task slug",
  }),
});

export const ListTasksQuerySchema = Schema.Struct({
  isCompleted: Schema.optionalKey(
    Schema.Literals(["true", "false"]).annotate({
      description: "Filter by completed flag",
    })
  ),
  page: Schema.optionalKey(
    PageNumberFromString.annotate({
      default: 1,
      description: "Page number",
    })
  ),
});

export const TaskListSchema = Schema.Array(TaskSchema);

export type ListTasksQuery = typeof ListTasksQuerySchema.Type;
export type Task = typeof TaskSchema.Type;
export type TaskParams = typeof TaskParamsSchema.Type;
