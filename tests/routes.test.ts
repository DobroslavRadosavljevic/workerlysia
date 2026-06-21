import { treaty } from "@elysiajs/eden";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import app from "../src/index";
import { resetTestKv } from "./mocks/cloudflare-workers";
import {
  createMinecraftFetchMock,
  HISTORICAL_VERSION_ID,
  NOTCH_UUID,
  SKIN_TEXTURE_ID,
} from "./mocks/minecraft-fetch";

const api = treaty(app);

interface ErrorPayload {
  readonly error?: string;
  readonly message?: string;
  readonly on?: string;
  readonly property?: string;
  readonly type?: string;
}

interface OpenApiPayload {
  readonly openapi: string;
  readonly paths: Record<string, unknown>;
}

const rawRequest = (path: string, init?: RequestInit): Promise<Response> =>
  app.handle(new Request(`http://localhost${path}`, init));

const rawJson = async <T>(response: Response): Promise<T> =>
  (await response.json()) as T;

beforeEach(() => {
  resetTestKv();
  vi.stubGlobal("fetch", createMinecraftFetchMock());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HTTP routes", () => {
  it("serves the welcome endpoint and OpenAPI documentation routes", async () => {
    const welcome = await api.get();
    expect(welcome.error).toBeNull();
    if (welcome.error) {
      throw welcome.error;
    }

    expect(welcome.data).toEqual({
      docs: "/docs",
      message: "Welcome to Workerlysia API",
      version: "1.0.0",
    });

    const docs = await rawRequest("/docs");
    expect(docs.status).toBe(200);
    expect(await docs.text()).toContain("Workerlysia API");

    const openapi = await rawRequest("/docs/openapi.json");
    expect(openapi.status).toBe(200);

    const spec = await rawJson<OpenApiPayload>(openapi);
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.paths).toHaveProperty("/");
    expect(spec.paths).toHaveProperty("/minecraft/players/{nameOrUuid}");
    expect(spec.paths).toHaveProperty("/minecraft/players/resolve");
    expect(spec.paths).toHaveProperty("/minecraft/profiles/{nameOrUuid}");
    expect(spec.paths).toHaveProperty("/minecraft/profiles/{nameOrUuid}/skin");
    expect(spec.paths).toHaveProperty("/minecraft/textures/{textureId}");
    expect(spec.paths).toHaveProperty("/minecraft/versions");
    expect(spec.paths).not.toHaveProperty("/tasks");
    expect(spec.paths).not.toHaveProperty("/kv/{key}");
  });

  it("resolves a player by username with Eden Treaty and caches official responses", async () => {
    const first = await api.minecraft.players({ nameOrUuid: "Notch" }).get();
    expect(first.error).toBeNull();
    if (first.error) {
      throw first.error;
    }

    expect(first.data).toMatchObject({
      cache: {
        session: "miss",
        username: "miss",
      },
      name: "Notch",
      skin: {
        model: "slim",
        textureId: SKIN_TEXTURE_ID,
        url: `/minecraft/textures/${SKIN_TEXTURE_ID}`,
      },
      uuid: NOTCH_UUID,
      uuidDashed: "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    });

    const second = await api.minecraft.players({ nameOrUuid: "Notch" }).get();
    expect(second.error).toBeNull();
    if (second.error) {
      throw second.error;
    }

    expect(second.data.cache).toEqual({
      session: "hit",
      username: "hit",
    });
  });

  it("resolves bulk usernames and reports missing names as data", async () => {
    const response = await api.minecraft.players.resolve.post({
      usernames: ["Notch", "jeb_", "MissingName"],
    });
    expect(response.error).toBeNull();
    if (response.error) {
      throw response.error;
    }

    expect(response.data).toEqual({
      cache: {
        hits: 0,
        misses: 3,
      },
      missing: ["MissingName"],
      resolved: [
        {
          name: "Notch",
          uuid: NOTCH_UUID,
          uuidDashed: "069a79f4-44e9-4726-a5be-fca90e38aaf5",
        },
        {
          name: "jeb_",
          uuid: "853c80ef3c3749fdaa49938b674adae6",
          uuidDashed: "853c80ef-3c37-49fd-aa49-938b674adae6",
        },
      ],
    });
  });

  it("serves profile, skin, and texture routes from official APIs", async () => {
    const profile = await api.minecraft.profiles({ nameOrUuid: "Notch" }).get({
      query: { signed: "true" },
    });
    expect(profile.error).toBeNull();
    if (profile.error) {
      throw profile.error;
    }

    expect(profile.data).toMatchObject({
      cache: { status: "miss" },
      name: "Notch",
      signed: true,
      skin: {
        sourceUrl: `http://textures.minecraft.net/texture/${SKIN_TEXTURE_ID}`,
        textureId: SKIN_TEXTURE_ID,
      },
      uuid: NOTCH_UUID,
    });
    expect(profile.data.properties[0]?.value).toEqual(expect.any(String));

    const uuidProfile = await api.minecraft
      .profiles({ nameOrUuid: NOTCH_UUID })
      .get();
    expect(uuidProfile.error).toBeNull();
    if (uuidProfile.error) {
      throw uuidProfile.error;
    }
    expect(uuidProfile.data.uuid).toBe(NOTCH_UUID);

    const skin = await rawRequest("/minecraft/profiles/Notch/skin");
    expect(skin.status).toBe(200);
    expect(skin.headers.get("content-type")).toBe("image/png");
    expect(skin.headers.get("cache-control")).toBe("public, max-age=300");
    expect(await skin.arrayBuffer()).toHaveProperty("byteLength", 8);

    const texture = await rawRequest(`/minecraft/textures/${SKIN_TEXTURE_ID}`);
    expect(texture.status).toBe(200);
    expect(texture.headers.get("content-type")).toBe("image/png");
    expect(texture.headers.get("cache-control")).toBe(
      "public, max-age=31536000, immutable"
    );
  });

  it("serves official blocked server hashes and Piston version metadata", async () => {
    const blockedServers = await rawRequest("/minecraft/blocked-servers");
    expect(blockedServers.status).toBe(200);
    expect(await rawJson(blockedServers)).toEqual({
      cache: { status: "miss" },
      count: 2,
      hashes: ["hash-one", "hash-two"],
    });

    const versions = await api.minecraft.versions.get();
    expect(versions.error).toBeNull();
    if (versions.error) {
      throw versions.error;
    }
    expect(versions.data.latest.release).toBe("1.21.6");
    expect(versions.data.versions[0]?.id).toBe("1.21.6");

    const version = await api.minecraft.versions({ versionId: "1.21.6" }).get();
    expect(version.error).toBeNull();
    if (version.error) {
      throw version.error;
    }
    expect(version.data.summary.id).toBe("1.21.6");
    expect(version.data.metadata).toMatchObject({
      id: "1.21.6",
      type: "release",
    });

    const historicalVersion = await rawRequest(
      `/minecraft/versions/${encodeURIComponent(HISTORICAL_VERSION_ID)}`
    );
    expect(historicalVersion.status).toBe(200);
    expect(await rawJson(historicalVersion)).toMatchObject({
      metadata: {
        id: HISTORICAL_VERSION_ID,
        type: "snapshot",
      },
      summary: {
        id: HISTORICAL_VERSION_ID,
      },
    });
  });

  it("rejects invalid Minecraft request schemas", async () => {
    const invalidPlayer = await rawRequest("/minecraft/players/no");
    expect(invalidPlayer.status).toBe(422);
    expect(await rawJson<ErrorPayload>(invalidPlayer)).toMatchObject({
      on: "params",
      property: "nameOrUuid",
      type: "validation",
    });

    const invalidProfile = await rawRequest("/minecraft/profiles/no");
    expect(invalidProfile.status).toBe(422);
    expect(await rawJson<ErrorPayload>(invalidProfile)).toMatchObject({
      on: "params",
      property: "nameOrUuid",
      type: "validation",
    });

    const invalidBulk = await rawRequest("/minecraft/players/resolve", {
      body: JSON.stringify({
        usernames: Array.from({ length: 11 }, (_, index) => `User_${index}`),
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
    expect(invalidBulk.status).toBe(422);
    expect(await rawJson<ErrorPayload>(invalidBulk)).toMatchObject({
      on: "body",
      property: "usernames",
      type: "validation",
    });

    const missingPlayer = await api.minecraft
      .players({
        nameOrUuid: "MissingName",
      })
      .get();
    expect(missingPlayer.status).toBe(404);
    expect(missingPlayer.error).toMatchObject({
      status: 404,
      value: { error: "Minecraft player not found" },
    });
  });
});
