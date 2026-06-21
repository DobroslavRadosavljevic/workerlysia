import { expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { afterEach, beforeEach, vi } from "vitest";

import { MojangApiLive } from "../src/modules/minecraft/services/mojang-api/live";
import { MojangApiService } from "../src/modules/minecraft/services/mojang-api/service";
import {
  createMinecraftFetchMock,
  NOTCH_UUID,
  SKIN_TEXTURE_ID,
} from "./mocks/minecraft-fetch";

beforeEach(() => {
  vi.stubGlobal("fetch", createMinecraftFetchMock());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const MojangApiTestLayer = MojangApiLive.pipe(
  Layer.provide(FetchHttpClient.layer)
);

layer(MojangApiTestLayer)("MojangApiService", (it) => {
  it.effect("decodes official username and session profile responses", () =>
    Effect.gen(function* decodeOfficialProfileResponses() {
      const api = yield* MojangApiService;
      const profile = yield* api.resolveUsername("Notch");
      const session = yield* api.getSessionProfile(NOTCH_UUID, false);

      expect(profile).toEqual({
        id: NOTCH_UUID,
        name: "Notch",
      });
      expect(session.id).toBe(NOTCH_UUID);
      expect(session.properties[0]?.name).toBe("textures");
    })
  );

  it.effect("fetches official texture and Piston metadata responses", () =>
    Effect.gen(function* fetchOfficialTextureAndPistonMetadata() {
      const api = yield* MojangApiService;
      const texture = yield* api.getTexture(SKIN_TEXTURE_ID);
      const manifest = yield* api.getVersionManifest();
      const metadata = yield* api.getVersionMetadata(
        "1.21.6",
        manifest.versions[0]?.url ?? ""
      );

      expect(texture.contentType).toBe("image/png");
      expect(texture.body.byteLength).toBe(8);
      expect(manifest.latest.release).toBe("1.21.6");
      expect(metadata).toMatchObject({
        id: "1.21.6",
        type: "release",
      });
    })
  );
});
