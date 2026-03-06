import { trace } from "./ledger.js";

const DEFAULT_OLLAMA_URL = "http://localhost:11434";

export interface GenerateOptions {
  model: string;
  prompt: string;
  stream?: boolean;
}

export interface OllamaGenerateResponse {
  response: string;
  done?: boolean;
  [key: string]: unknown;
}

export interface WrappedOllama {
  generate(options: GenerateOptions): Promise<OllamaGenerateResponse>;
}

/**
 * Wrap Ollama so every generate() call is automatically traced to the ledger.
 * @param baseUrl - Ollama server URL (default: http://localhost:11434)
 */
export function wrapOllama(baseUrl: string = DEFAULT_OLLAMA_URL): WrappedOllama {
  const base = baseUrl.replace(/\/$/, "");

  return {
    async generate({ model, prompt, stream = false }) {
      const start = Date.now();

      const res = await fetch(`${base}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt, stream }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ollama error ${res.status}: ${text}`);
      }

      const data = (await res.json()) as OllamaGenerateResponse;
      const latency = Date.now() - start;

      await trace({
        agent: "ollama-agent",
        model,
        prompt,
        response: data.response ?? "",
        latency,
      });

      return data;
    },
  };
}
