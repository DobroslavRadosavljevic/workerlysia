export const toDashlessUuid = (uuid: string): string =>
  uuid.replaceAll("-", "").toLowerCase();
