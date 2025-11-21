import path from "path";
import { pipeline, Pipeline, env } from "@xenova/transformers";

// Configure Transformers.js to run entirely on the Node runtime.
const transformersCacheDir =
  process.env.TRANSFORMERS_CACHE ||
  path.join(process.cwd(), ".cache/transformers");

env.allowLocalModels = true;
env.useFS = true;
env.useFSCache = true;
env.cacheDir = transformersCacheDir;
env.useBrowserCache = false;

const wasmAssetPath = path.join(
  process.cwd(),
  "node_modules/@xenova/transformers/dist/"
);

if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.wasmPaths = wasmAssetPath;
  env.backends.onnx.wasm.proxy = false;
  env.backends.onnx.wasm.numThreads = 1;
}

// We use a singleton pattern so we don't reload the AI model on every request
class EmbeddingPipeline {
  static task = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance: Promise<Pipeline> | null = null;

  static async getInstance() {
    if (this.instance === null) {
      // This downloads the model locally (matches your Python script's model)
      this.instance = pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await EmbeddingPipeline.getInstance();

  // Generate embedding
  const output = await extractor(text, { pooling: "mean", normalize: true });

  // Convert Tensor to plain array
  return Array.from(output.data);
}
