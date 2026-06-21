import { openapi } from "@elysiajs/openapi";
import { Schema } from "effect";
import { Elysia } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";

import { welcomeRoute } from "./modules/general/api/routes/welcome";
import { getMinecraftBlockedServersRoute } from "./modules/minecraft/api/routes/get-blocked-servers";
import { getMinecraftPlayerRoute } from "./modules/minecraft/api/routes/get-player";
import { getMinecraftProfileRoute } from "./modules/minecraft/api/routes/get-profile";
import { getMinecraftSkinRoute } from "./modules/minecraft/api/routes/get-skin";
import { getMinecraftTextureRoute } from "./modules/minecraft/api/routes/get-texture";
import { getMinecraftVersionRoute } from "./modules/minecraft/api/routes/get-version";
import { listMinecraftVersionsRoute } from "./modules/minecraft/api/routes/list-versions";
import { resolveMinecraftPlayersRoute } from "./modules/minecraft/api/routes/resolve-players";

const app = new Elysia({ adapter: CloudflareAdapter })
  .use(
    openapi({
      documentation: {
        info: {
          description:
            "A public reference Cloudflare Worker API using Elysia, Effect, Effect Schema, and KV caching. The current example proxies official Minecraft APIs only.",
          license: {
            name: "MIT",
          },
          title: "Workerlysia API",
          version: "1.0.0",
        },
      },
      mapJsonSchema: {
        effect: (schema: Schema.Top) =>
          Schema.toJsonSchemaDocument(schema).schema,
      },
      path: "/docs",
      specPath: "/docs/openapi.json",
    })
  )
  .use(welcomeRoute)
  .use(resolveMinecraftPlayersRoute)
  .use(getMinecraftPlayerRoute)
  .use(getMinecraftSkinRoute)
  .use(getMinecraftProfileRoute)
  .use(getMinecraftTextureRoute)
  .use(getMinecraftBlockedServersRoute)
  .use(listMinecraftVersionsRoute)
  .use(getMinecraftVersionRoute)
  .compile();

export type App = typeof app;

export default app;
