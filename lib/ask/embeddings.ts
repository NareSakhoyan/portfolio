import type { EnvLike } from "@/lib/env";
import type { AskIndex } from "./types";

export type EmbeddingConfig = NonNullable<AskIndex["embeddings"]>;

const VOYAGE_MODEL = "voyage-3-lite";
const OPENAI_MODEL = "text-embedding-3-small";

/** Picks an embedding provider from the environment. Returns null when none is configured. */
export function detectEmbeddingProvider(
  env: EnvLike = process.env,
): { provider: EmbeddingConfig["provider"]; model: string; apiKey: string } | null {
  if (env.VOYAGE_API_KEY) {
    return { provider: "voyage", model: env.EMBEDDING_MODEL ?? VOYAGE_MODEL, apiKey: env.VOYAGE_API_KEY };
  }
  if (env.OPENAI_API_KEY) {
    return { provider: "openai", model: env.EMBEDDING_MODEL ?? OPENAI_MODEL, apiKey: env.OPENAI_API_KEY };
  }
  return null;
}

interface EmbeddingResponse {
  data: { embedding: number[] }[];
}

export async function embedTexts(
  texts: string[],
  inputType: "document" | "query",
  env: EnvLike = process.env,
): Promise<{ config: EmbeddingConfig; vectors: number[][] } | null> {
  const provider = detectEmbeddingProvider(env);
  if (!provider) return null;

  const url =
    provider.provider === "voyage"
      ? "https://api.voyageai.com/v1/embeddings"
      : "https://api.openai.com/v1/embeddings";
  const body =
    provider.provider === "voyage"
      ? { input: texts, model: provider.model, input_type: inputType }
      : { input: texts, model: provider.model };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${provider.apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Embedding request failed (${provider.provider}): ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as EmbeddingResponse;
  const vectors = json.data.map((d) => d.embedding);
  return {
    config: { provider: provider.provider, model: provider.model, dimensions: vectors[0]?.length ?? 0 },
    vectors,
  };
}
