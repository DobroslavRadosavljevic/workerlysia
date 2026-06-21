type TestGlobal = typeof globalThis & {
  workerlysiaTestKv?: Map<string, string>;
};

const getStore = (): Map<string, string> => {
  const testGlobal = globalThis as TestGlobal;
  testGlobal.workerlysiaTestKv ??= new Map<string, string>();
  return testGlobal.workerlysiaTestKv;
};

export const resetTestKv = (): void => {
  getStore().clear();
};

export const env = {
  KV: {
    delete: (key: string): Promise<void> => {
      getStore().delete(key);
      return Promise.resolve();
    },
    get: (key: string): Promise<string | null> =>
      Promise.resolve(getStore().get(key) ?? null),
    put: (key: string, value: string): Promise<void> => {
      getStore().set(key, value);
      return Promise.resolve();
    },
  },
};
