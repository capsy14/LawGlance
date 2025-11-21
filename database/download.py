import kagglehub
import shutil
import os

def download_kaggle_dataset():
    # Dataset identifier
    dataset_id = "adarshsingh0903/legal-dataset-sc-judgments-india-19502024"
    
    # Target folder name
    target_folder = "dataset"
    
    print("Downloading dataset...")
    
    try:
        # Download the dataset
        downloaded_path = kagglehub.dataset_download(dataset_id)
        
        print(f"Dataset downloaded to cache: {downloaded_path}")
        
        # Create target directory if it doesn't exist
        if os.path.exists(target_folder):
            shutil.rmtree(target_folder)
            print(f"Removed existing '{target_folder}' folder")
        
        # Copy the downloaded dataset to the target folder
        shutil.copytree(downloaded_path, target_folder)
        
        print(f"Dataset successfully copied to: {os.path.abspath(target_folder)}")
        
        # List contents of the downloaded folder
        print("\nContents of the dataset folder:")
        for item in os.listdir(target_folder):
            print(f"  - {item}")
            
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    download_kaggle_dataset()