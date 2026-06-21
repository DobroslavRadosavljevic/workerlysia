import { vi } from "vitest";

export const NOTCH_UUID = "069a79f444e94726a5befca90e38aaf5";
export const JEB_UUID = "853c80ef3c3749fdaa49938b674adae6";
export const SKIN_TEXTURE_ID =
  "292009a4925b58f02c77dadc3ecef07ea4c7472f64e0fdc32ce5522489362680";
export const HISTORICAL_VERSION_ID = "1.14.2 Pre-Release 4";

const versionSummary = {
  id: "1.21.6",
  releaseTime: "2026-06-17T09:24:59+00:00",
  time: "2026-06-17T09:24:59+00:00",
  type: "release",
  url: "https://piston-meta.mojang.com/v1/packages/example/1.21.6.json",
};

const historicalVersionSummary = {
  id: HISTORICAL_VERSION_ID,
  releaseTime: "2019-05-27T11:11:03+00:00",
  time: "2019-05-27T11:11:03+00:00",
  type: "snapshot",
  url: "https://piston-meta.mojang.com/v1/packages/example/1.14.2-pre4.json",
};

export const versionManifestFixture = {
  latest: {
    release: "1.21.6",
    snapshot: "25w21a",
  },
  versions: [versionSummary, historicalVersionSummary],
};

export const versionMetadataFixture = {
  downloads: {},
  id: "1.21.6",
  type: "release",
};

export const historicalVersionMetadataFixture = {
  downloads: {},
  id: HISTORICAL_VERSION_ID,
  type: "snapshot",
};

const versionMetadataByUrl = new Map<string, unknown>([
  [versionSummary.url, versionMetadataFixture],
  [historicalVersionSummary.url, historicalVersionMetadataFixture],
]);

export const sessionProfileFixture = {
  id: NOTCH_UUID,
  name: "Notch",
  properties: [
    {
      name: "textures",
      value: Buffer.from(
        JSON.stringify({
          profileId: NOTCH_UUID,
          profileName: "Notch",
          textures: {
            SKIN: {
              metadata: {
                model: "slim",
              },
              url: `http://textures.minecraft.net/texture/${SKIN_TEXTURE_ID}`,
            },
          },
          timestamp: 1_782_070_000_000,
        })
      ).toString("base64"),
    },
  ],
};

const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

const responseJson = (value: unknown, status = 200): Response =>
  Response.json(value, {
    headers: {
      "cache-control": "max-age=300",
    },
    status,
  });

const requestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
};

export const createMinecraftFetchMock = () =>
  vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = requestUrl(input);
    const method = init?.method ?? "GET";

    if (
      method === "GET" &&
      url ===
        "https://api.minecraftservices.com/minecraft/profile/lookup/name/Notch"
    ) {
      return Promise.resolve(responseJson({ id: NOTCH_UUID, name: "Notch" }));
    }

    if (
      method === "GET" &&
      url ===
        "https://api.minecraftservices.com/minecraft/profile/lookup/name/MissingName"
    ) {
      return Promise.resolve(responseJson({ error: "Not Found" }, 404));
    }

    if (
      method === "POST" &&
      url ===
        "https://api.minecraftservices.com/minecraft/profile/lookup/bulk/byname"
    ) {
      return Promise.resolve(
        responseJson([
          { id: NOTCH_UUID, name: "Notch" },
          { id: JEB_UUID, name: "jeb_" },
        ])
      );
    }

    if (
      method === "GET" &&
      url.startsWith(
        "https://sessionserver.mojang.com/session/minecraft/profile/"
      )
    ) {
      return Promise.resolve(responseJson(sessionProfileFixture));
    }

    if (
      method === "GET" &&
      url === `https://textures.minecraft.net/texture/${SKIN_TEXTURE_ID}`
    ) {
      return Promise.resolve(
        new Response(pngBytes, {
          headers: {
            "content-type": "image/png",
            etag: '"skin-texture"',
            "last-modified": "Sun, 21 Jun 2026 00:00:00 GMT",
          },
          status: 200,
        })
      );
    }

    if (
      method === "GET" &&
      url === "https://sessionserver.mojang.com/blockedservers"
    ) {
      return Promise.resolve(
        new Response("hash-one\nhash-two\n", {
          headers: {
            "content-type": "text/plain",
          },
          status: 200,
        })
      );
    }

    if (
      method === "GET" &&
      url === "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
    ) {
      return Promise.resolve(responseJson(versionManifestFixture));
    }

    const versionMetadata = versionMetadataByUrl.get(url);

    if (method === "GET" && versionMetadata) {
      return Promise.resolve(responseJson(versionMetadata));
    }

    return Promise.resolve(
      responseJson({ error: `Unhandled fixture URL: ${url}` }, 404)
    );
  });
