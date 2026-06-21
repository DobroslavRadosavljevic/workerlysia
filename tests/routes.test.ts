import { treaty } from "@elysiajs/eden";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../src/index";
import { resetTestKv } from "./mocks/cloudflare-workers";

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
    expect(spec.paths).toHaveProperty("/tasks");
    expect(spec.paths).toHaveProperty("/kv/{key}");
  });

  it("serves task routes with Eden Treaty type-safe requests", async () => {
    const list = await api.tasks.get();
    expect(list.error).toBeNull();
    if (list.error) {
      throw list.error;
    }
    expect(list.data).toHaveLength(2);

    const filtered = await api.tasks.get({
      query: { isCompleted: "true", page: 1 },
    });
    expect(filtered.error).toBeNull();
    if (filtered.error) {
      throw filtered.error;
    }
    expect(filtered.data).toEqual([
      expect.objectContaining({
        completed: true,
        slug: "cloudflare-workers",
      }),
    ]);

    const created = await api.tasks.post({
      completed: false,
      due_date: "2026-06-21",
      name: "Test task",
      slug: "test-task",
    });
    expect(created.error).toBeNull();
    if (created.error) {
      throw created.error;
    }
    expect(created.data).toMatchObject({
      completed: false,
      name: "my task",
      slug: "my-task",
    });

    const task = await api.tasks({ taskSlug: "example-task" }).get();
    expect(task.error).toBeNull();
    if (task.error) {
      throw task.error;
    }
    expect(task.data).toMatchObject({
      completed: false,
      slug: "example-task",
    });

    const deleted = await api.tasks({ taskSlug: "example-task" }).delete();
    expect(deleted.error).toBeNull();
    if (deleted.error) {
      throw deleted.error;
    }
    expect(deleted.data).toEqual({ success: true });
  });

  it("rejects invalid task request schemas", async () => {
    const invalidQuery = await rawRequest("/tasks?isCompleted=maybe");
    expect(invalidQuery.status).toBe(422);
    expect(await rawJson<ErrorPayload>(invalidQuery)).toMatchObject({
      on: "query",
      property: "isCompleted",
      type: "validation",
    });

    const invalidBody = await rawRequest("/tasks", {
      body: JSON.stringify({
        completed: false,
        due_date: "bad-date",
        name: "Bad task",
        slug: "bad-task",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
    expect(invalidBody.status).toBe(422);
    expect(await rawJson<ErrorPayload>(invalidBody)).toMatchObject({
      on: "body",
      property: "due_date",
      type: "validation",
    });
  });

  it("serves KV routes with Eden Treaty type-safe requests", async () => {
    const stored = await api.kv({ key: "test-key" }).put({ value: "hello" });
    expect(stored.error).toBeNull();
    if (stored.error) {
      throw stored.error;
    }
    expect(stored.data).toEqual({
      key: "test-key",
      value: "hello",
    });

    const fetched = await api.kv({ key: "test-key" }).get();
    expect(fetched.error).toBeNull();
    if (fetched.error) {
      throw fetched.error;
    }
    expect(fetched.data).toEqual({
      key: "test-key",
      value: "hello",
    });

    const invalidBody = await rawRequest("/kv/invalid-body", {
      body: JSON.stringify({ wrong: "shape" }),
      headers: {
        "content-type": "application/json",
      },
      method: "PUT",
    });
    expect(invalidBody.status).toBe(422);
    expect(await rawJson<ErrorPayload>(invalidBody)).toMatchObject({
      on: "body",
      property: "value",
      type: "validation",
    });

    const deleted = await api.kv({ key: "test-key" }).delete();
    expect(deleted.error).toBeNull();
    if (deleted.error) {
      throw deleted.error;
    }
    expect(deleted.data).toEqual({ deleted: "test-key" });

    const missing = await api.kv({ key: "test-key" }).get();
    expect(missing.status).toBe(404);
    expect(missing.error).toMatchObject({
      status: 404,
      value: { error: "Key not found" },
    });
  });

  it("serves cached demo routes through the cache macro", async () => {
    const cached = await api.demo.cached.get();
    expect(cached.error).toBeNull();
    if (cached.error) {
      throw cached.error;
    }
    expect(cached.response.headers.get("x-cache")).toBe("MISS");
    expect(cached.data).toMatchObject({
      data: "This response is cached",
    });

    const cachedAgain = await api.demo.cached.get();
    expect(cachedAgain.error).toBeNull();
    if (cachedAgain.error) {
      throw cachedAgain.error;
    }
    expect(cachedAgain.response.headers.get("x-cache")).toBe("HIT");
    expect(cachedAgain.data).toEqual(cached.data);

    const cachedLong = await api.demo["cached-long"].get();
    expect(cachedLong.error).toBeNull();
    if (cachedLong.error) {
      throw cachedLong.error;
    }
    expect(cachedLong.data).toMatchObject({
      data: "This response is cached for longer",
    });

    const notCached = await api.demo["not-cached"].get();
    expect(notCached.error).toBeNull();
    if (notCached.error) {
      throw notCached.error;
    }
    expect(notCached.data).toMatchObject({
      data: "This response is NOT cached",
    });
  });

  it("serves rate-limit demo routes and returns 429 after the limit", async () => {
    const allowedResponses = [
      await api.demo["rate-limited"].get(),
      await api.demo["rate-limited"].get(),
      await api.demo["rate-limited"].get(),
      await api.demo["rate-limited"].get(),
      await api.demo["rate-limited"].get(),
    ];

    for (const allowed of allowedResponses) {
      expect(allowed.error).toBeNull();
      if (allowed.error) {
        throw allowed.error;
      }
      expect(allowed.data).toMatchObject({
        message: "This endpoint is rate limited",
      });
    }

    const limited = await api.demo["rate-limited"].get();
    expect(limited.status).toBe(429);
    expect(limited.error).toMatchObject({
      status: 429,
      value: { error: "Too Many Requests" },
    });

    const strict = await api.demo["rate-limited-strict"].get();
    expect(strict.error).toBeNull();
    if (strict.error) {
      throw strict.error;
    }
    expect(strict.data).toMatchObject({
      message: "This endpoint has strict rate limiting",
    });

    const noLimit = await api.demo["no-limit"].get();
    expect(noLimit.error).toBeNull();
    if (noLimit.error) {
      throw noLimit.error;
    }
    expect(noLimit.data).toMatchObject({
      message: "This endpoint has no rate limit",
    });
  });
});
