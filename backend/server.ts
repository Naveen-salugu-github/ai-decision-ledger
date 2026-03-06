import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import sensible from "@fastify/sensible";
import dotenv from "dotenv";
import { initDb } from "./db.js";
import { tracesRoutes } from "./routes/traces.js";

dotenv.config();

async function buildServer() {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV === "production"
          ? undefined
          : {
              target: "pino-pretty",
              options: {
                translateTime: "SYS:standard",
                ignore: "pid,hostname"
              }
            }
    }
  });

  await app.register(cors, {
    origin: true
  });
  await app.register(formbody);
  await app.register(sensible);

  app.get("/health", async () => {
    return { ok: true };
  });

  await app.register(tracesRoutes);

  return app;
}

async function start() {
  try {
    await initDb();
    const app = await buildServer();
    const port = Number(process.env.PORT) || 4000;
    const host = process.env.HOST || "0.0.0.0";

    await app.listen({ port, host });
    app.log.info(`Server listening on http://${host}:${port}`);
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

