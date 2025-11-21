const externalPackages = [
  "@xenova/transformers",
  "chromadb",
  "@chroma-core/default-embed",
  "@chroma-core/sentence-transformer",
  "onnxruntime-node",
  "onnxruntime-web",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: externalPackages,
  },
  serverExternalPackages: externalPackages,
};

export default nextConfig;