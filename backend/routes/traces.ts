import { FastifyInstance, FastifyPluginOptions } from "fastify";
import pool from "../db.js";

interface TracePostBody {
  trace_id?: string;
  agent: string;
  model: string;
  prompt: string;
  response: string;
  timestamp?: string;
  tool_calls?: string[] | null;
  latency?: number | null;
  risk_flag?: boolean;
}

export async function tracesRoutes(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  // Store trace
  app.post<{
    Body: TracePostBody;
  }>("/trace", async (request, reply) => {
    const {
      agent,
      model,
      prompt,
      response,
      timestamp,
      tool_calls,
      latency,
      risk_flag
    } = request.body;

    if (!agent || !model || !prompt) {
      return reply.status(400).send({ error: "agent, model, and prompt are required" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const traceInsert = await client.query(
        `INSERT INTO traces (agent, model, created_at)
         VALUES ($1, $2, COALESCE($3::timestamptz, NOW()))
         RETURNING id, agent, model, created_at`,
        [agent, model, timestamp || null]
      );

      const trace = traceInsert.rows[0];

      // main step for the model call
      await client.query(
        `INSERT INTO steps (trace_id, prompt, response, latency_ms, risk_flag)
         VALUES ($1, $2, $3, $4, $5)`,
        [trace.id, prompt, response, latency ?? null, risk_flag ?? false]
      );

      // optional tool call steps
      if (tool_calls && Array.isArray(tool_calls)) {
        for (const toolCall of tool_calls) {
          await client.query(
            `INSERT INTO steps (trace_id, tool_call, risk_flag)
             VALUES ($1, $2, $3)`,
            [trace.id, toolCall, false]
          );
        }
      }

      await client.query("COMMIT");

      return reply.status(201).send({ trace_id: trace.id });
    } catch (err) {
      await client.query("ROLLBACK");
      app.log.error({ err }, "Failed to insert trace");
      return reply.status(500).send({ error: "Failed to insert trace" });
    } finally {
      client.release();
    }
  });

  // List recent traces
  app.get("/traces", async (_request, reply) => {
    try {
      const result = await pool.query(
        `
        SELECT
          t.id,
          t.agent,
          t.model,
          t.created_at,
          COALESCE(MAX(s.latency_ms), 0) AS max_latency_ms,
          BOOL_OR(s.risk_flag) AS has_risk
        FROM traces t
        LEFT JOIN steps s ON s.trace_id = t.id
        GROUP BY t.id, t.agent, t.model, t.created_at
        ORDER BY t.created_at DESC
        LIMIT 100
        `
      );

      return reply.send({ traces: result.rows });
    } catch (err) {
      app.log.error({ err }, "Failed to list traces");
      return reply.status(500).send({ error: "Failed to list traces" });
    }
  });

  // Get single trace with steps
  app.get<{
    Params: { id: string };
  }>("/trace/:id", async (request, reply) => {
    const { id } = request.params;

    try {
      const traceRes = await pool.query(
        `SELECT id, agent, model, created_at FROM traces WHERE id = $1`,
        [id]
      );

      if (traceRes.rowCount === 0) {
        return reply.status(404).send({ error: "Trace not found" });
      }

      const stepsRes = await pool.query(
        `SELECT id, prompt, response, tool_call, latency_ms, risk_flag, created_at
         FROM steps
         WHERE trace_id = $1
         ORDER BY created_at ASC`,
        [id]
      );

      return reply.send({
        trace: traceRes.rows[0],
        steps: stepsRes.rows
      });
    } catch (err) {
      app.log.error({ err }, "Failed to get trace");
      return reply.status(500).send({ error: "Failed to get trace" });
    }
  });

  // Replay a trace (real execution via Ollama)
  app.post<{
    Params: { id: string };
  }>("/trace/:id/replay", async (request, reply) => {
    const { id } = request.params;
    const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

    try {
      const traceRes = await pool.query(
        `SELECT id, agent, model, created_at FROM traces WHERE id = $1`,
        [id]
      );
      if (traceRes.rowCount === 0) {
        return reply.status(404).send({ error: "Trace not found" });
      }

      const stepsRes = await pool.query(
        `SELECT prompt, response
         FROM steps
         WHERE trace_id = $1
         ORDER BY created_at ASC
         LIMIT 1`,
        [id]
      );

      const primaryStep = stepsRes.rows[0];
      const trace = traceRes.rows[0];

      if (!primaryStep?.prompt) {
        return reply.status(400).send({
          error: "No prompt found for this trace"
        });
      }

      const start = Date.now();
      let ollamaRes: Response;
      try {
        ollamaRes = await fetch(`${OLLAMA_BASE}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: trace.model,
            prompt: primaryStep.prompt,
            stream: false
          })
        });
      } catch (_err) {
        app.log.warn({ err: _err }, "Ollama request failed");
        return reply.status(503).send({
          error: "Local model server unavailable"
        });
      }

      if (!ollamaRes.ok) {
        app.log.warn({ status: ollamaRes.status }, "Ollama returned error");
        return reply.status(503).send({
          error: "Local model server unavailable"
        });
      }

      let result: { response?: string };
      try {
        result = await ollamaRes.json();
      } catch (_err) {
        app.log.warn({ err: _err }, "Ollama response not JSON");
        return reply.status(503).send({
          error: "Local model server unavailable"
        });
      }

      const latency_ms = Date.now() - start;
      const replayResponse = result?.response ?? "";

      return reply.send({
        model: trace.model,
        original_prompt: primaryStep.prompt,
        original_response: primaryStep.response ?? null,
        replay_response: replayResponse,
        latency_ms
      });
    } catch (err) {
      app.log.error({ err }, "Failed to replay trace");
      return reply.status(500).send({ error: "Failed to replay trace" });
    }
  });
}

