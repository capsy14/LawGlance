import os
import chromadb
# Updated imports for modern LangChain versions
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from chromadb.utils import embedding_functions
import time
from tqdm import tqdm  # Progress bar

# --- CONFIGURATION ---
TEXT_DATA_FOLDER = "extracted_texts"  # Folder containing your .txt files
DB_PERSIST_DIRECTORY = "legal_db"    # Where to save the database
COLLECTION_NAME = "legal_judgments"  # Name of the collection inside DB

# --- SETUP CHROMA DB ---
print("Initializing ChromaDB Client...")

# Use a persistent client to save data to disk
client = chromadb.PersistentClient(path=DB_PERSIST_DIRECTORY)

# Use a specific, free, high-quality embedding model
# This will download 'all-MiniLM-L6-v2' automatically (approx 80MB)
embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Create or get the collection
collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    embedding_function=embedding_func,
    metadata={"hnsw:space": "cosine"} # Use cosine similarity for better text search
)

# --- SETUP TEXT SPLITTER ---
# We split text into chunks of 1000 characters with 200 overlap
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", ". ", " ", ""]
)

def process_and_index_files():
    # Get list of all .txt files
    if not os.path.exists(TEXT_DATA_FOLDER):
        print(f"Error: Folder '{TEXT_DATA_FOLDER}' not found.")
        return

    files = [f for f in os.listdir(TEXT_DATA_FOLDER) if f.endswith(".txt")]
    total_files = len(files)

    print(f"Found {total_files} text files to process.")

    # Iterate through files with a progress bar
    for i, filename in tqdm(enumerate(files), total=total_files, desc="Indexing"):
        file_path = os.path.join(TEXT_DATA_FOLDER, filename)

        try:
            # 1. Read the text file
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()

            # Skip empty files
            if not text.strip():
                continue

            # 2. Split text into chunks
            # We manually create Document objects for LangChain
            chunks = text_splitter.create_documents([text])

            # 3. Prepare data for Chroma
            ids = []
            documents = []
            metadatas = []

            for chunk_idx, chunk in enumerate(chunks):
                # Create a unique ID: filename_chunkNumber
                chunk_id = f"{filename}_{chunk_idx}"

                ids.append(chunk_id)
                documents.append(chunk.page_content)
                metadatas.append({"source": filename, "chunk_index": chunk_idx})

            # 4. Add to ChromaDB (Batch add is faster)
            if ids:
                collection.add(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas
                )

        except Exception as e:
            print(f"\nError processing {filename}: {e}")
            continue

    print("\n--- Indexing Complete! ---")
    print(f"Database saved to: {os.path.abspath(DB_PERSIST_DIRECTORY)}")

if __name__ == "__main__":
    process_and_index_files()
