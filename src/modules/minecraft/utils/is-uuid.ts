import { DASHED_UUID_PATTERN, DASHLESS_UUID_PATTERN } from "../constants";

export const isUuid = (value: string): boolean =>
  DASHLESS_UUID_PATTERN.test(value) || DASHED_UUID_PATTERN.test(value);
