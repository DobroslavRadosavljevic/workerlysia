import { Schema } from "effect";

const PageNumberFromString = Schema.NumberFromString.check(
  Schema.isInt(),
  Schema.isGreaterThanOrEqualTo(1)
);

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

export type ListTasksQuery = typeof ListTasksQuerySchema.Type;
