export interface BootStats {
  chunks: number;
  files: number;
  tools: number;
  cases: number;
  traps: number;
  model: string;
  retrieval: string;
}

export interface FilmEvalCase {
  id: string;
  question: string;
  expectRefusal: boolean;
}
