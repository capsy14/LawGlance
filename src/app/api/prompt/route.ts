import { NextRequest, NextResponse } from "next/server";
import { ChromaClient } from "chromadb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateEmbedding } from "@/lib/embeddings";

export const runtime = "nodejs";

// Initialize Clients
const chromaClient = new ChromaClient({ path: process.env.CHROMA_DB_URL });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const summarizeCaseText = (text: string, maxLength = 400) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, maxLength);
  const lastSentenceEnd = truncated.lastIndexOf(".");
  if (lastSentenceEnd > 50) {
    return `${truncated.slice(0, lastSentenceEnd + 1)} …`;
  }
  return `${truncated} …`;
};

const normalizeDocument = (doc: unknown): string => {
  if (typeof doc === "string") {
    return doc;
  }
  if (doc == null) {
    return "";
  }
  try {
    return JSON.stringify(doc);
  } catch {
    return String(doc);
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt ?? body.title ?? body.query;

    console.log("Prompt: ", prompt);

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // --- STEP 1: Embed the User's Query ---
    // We use the local Xenova model to ensure compatibility with your Python index
    const queryVector = await generateEmbedding(prompt);

    // --- STEP 2: Query ChromaDB ---
    const collection = await chromaClient.getCollection({
      name: process.env.COLLECTION_NAME || "legal_judgments",
    });

    const searchResults = await collection.query({
      queryEmbeddings: [queryVector],
      nResults: 2, // Fetch top 2 relevant chunks
    });

    // Check if we found anything
    const documents = searchResults.documents[0];
    const metadatas = searchResults.metadatas[0];

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find any relevant legal documents for your query.",
      });
    }

    // --- STEP 3: Construct the Context for Gemini ---
    const contextText = documents
      .map((doc, index) => {
        const docText = normalizeDocument(doc);
        const meta = metadatas[index] || {};
        return `[Source: ${meta.source || "Unknown"}]\n${docText}`;
      })
      .join("\n\n---\n\n");

    const cases = documents.map((doc, index) => {
      const meta = metadatas?.[index] || {};
      const content = normalizeDocument(doc);
      return {
        source: meta.source || "Unknown",
        chunkIndex: meta.chunk_index ?? meta.chunkIndex ?? index,
        summary: summarizeCaseText(content),
        content,
        metadata: meta,
      };
    });

    // --- STEP 4: Call Gemini API ---
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const fullPrompt = `
    You are an expert Indian Legal Assistant. 
    Use the following pieces of retrieved context to answer the user's question. 
    
    Rules:
    1. Answer solely based on the Context provided below.
    2. Cite the Source (Source: ...) for every claim you make.
    3. If the answer is not in the context, say "I cannot find the answer in the available documents."

    CONTEXT:
    ${contextText}

    USER QUESTION:
    ${prompt}
    `;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const answer = response.text();

    return NextResponse.json({ answer, sources: metadatas, cases });
  } catch (error) {
    console.error("Error processing request:", error);
    const details =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details },
      { status: 500 }
    );
  }
}
