import os
import PyPDF2
from pathlib import Path

def extract_text_from_pdfs():
    # Source and destination folders
    source_root = "./dataset/"
    target_root = "extracted_texts"

    print("=" * 60)
    print("PDF TEXT EXTRACTION SCRIPT")
    print(f"Source: {os.path.abspath(source_root)}")
    print(f"Target: {os.path.abspath(target_root)}")
    print("=" * 60)

    if not os.path.exists(source_root):
        print(f"❌ Source folder '{source_root}' does not exist!")
        return

    # Create target root folder if not exists
    os.makedirs(target_root, exist_ok=True)

    total_files = 0
    successful = 0
    failed = 0

    # Walk through all subdirectories and files
    for dirpath, dirnames, filenames in os.walk(source_root):
        # Get relative path from source_root to create same structure in target
        rel_path = os.path.relpath(dirpath, source_root)
        target_dir = os.path.join(target_root, rel_path)

        # Create corresponding directory in target
        os.makedirs(target_dir, exist_ok=True)

        # Process each PDF file
        for filename in filenames:
            if filename.lower().endswith('.pdf'):
                total_files += 1
                pdf_path = os.path.join(dirpath, filename)
                txt_filename = os.path.splitext(filename)[0] + ".txt"
                txt_path = os.path.join(target_dir, txt_filename)

                try:
                    with open(pdf_path, 'rb') as pdf_file:
                        reader = PyPDF2.PdfReader(pdf_file)
                        text = ""
                        for page in reader.pages:
                            text += page.extract_text() + "\n\n"

                    # Write text to .txt file
                    with open(txt_path, 'w', encoding='utf-8') as txt_file:
                        txt_file.write(text.strip())

                    successful += 1
                    print(f"✅ Extracted: {rel_path}/{filename} → {txt_filename}")

                except Exception as e:
                    failed += 1
                    print(f"❌ Failed to extract {filename}: {str(e)}")

    print("\n" + "=" * 60)
    print(f"📊 Extraction Summary:")
    print(f"Total PDFs processed: {total_files}")
    print(f"Successfully extracted: {successful}")
    print(f"Failed: {failed}")
    print(f"Output saved to: {os.path.abspath(target_root)}")
    print("=" * 60)

if __name__ == "__main__":
    # Install PyPDF2 if not already installed
    try:
        import PyPDF2
    except ImportError:
        print("📦 Installing PyPDF2...")
        os.system("pip install PyPDF2")
        import PyPDF2

    extract_text_from_pdfs()
