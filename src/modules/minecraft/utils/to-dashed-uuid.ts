import { toDashlessUuid } from "./to-dashless-uuid";

export const toDashedUuid = (uuid: string): string => {
  const dashless = toDashlessUuid(uuid);
  return `${dashless.slice(0, 8)}-${dashless.slice(8, 12)}-${dashless.slice(12, 16)}-${dashless.slice(16, 20)}-${dashless.slice(20)}`;
};
