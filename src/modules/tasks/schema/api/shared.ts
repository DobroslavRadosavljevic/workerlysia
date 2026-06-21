import { Schema } from "effect";

export const TaskCompletedSchema = Schema.Boolean.annotate({ default: false });

export const TaskDateStringSchema = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/u)
).annotate({
  examples: ["2025-01-05"],
  format: "date",
});

export const TaskDescriptionSchema = Schema.String;

export const TaskNameSchema = Schema.String.annotate({ examples: ["lorem"] });

export const TaskSlugSchema = Schema.String;
