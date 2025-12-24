import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';

let model: use.UniversalSentenceEncoder | null = null;

/**
 * Load embedding model once
 */
export async function loadEmbeddingModel() {
  if (!model) {
    model = await use.load();
    console.log('[Embedding] Model loaded');
  }
}

/**
 * Embed text into vector
 */
export async function embed(text: string): Promise<number[]> {
  if (!model) {
    throw new Error('Embedding model not loaded');
  }

  const embeddings = await model.embed([text]);
  const array = await embeddings.array();
  embeddings.dispose();

  return array[0];
}

/**
 * Cosine similarity
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

