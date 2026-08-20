import askIndexJson from "@/data/ask-index.json";
import { createRetriever, type Retriever } from "./retriever";
import type { AskIndex } from "./types";

let cached: Retriever | null = null;

/** The build-time index (data/ask-index.json) wrapped in a memoised retriever. */
export function getRetriever(): Retriever {
  if (!cached) cached = createRetriever(askIndexJson as AskIndex);
  return cached;
}
