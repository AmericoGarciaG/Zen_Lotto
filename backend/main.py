# backend/main.py
from .database import initialize_database
from .data_loader import load_data_from_csv
from .omega_analyzer import analizar_y_actualizar_clase_omega
from .config import TEST_CSV_PATH

def main():
    """Main function to run the backend processes."""
    print("[INFO] Initializing backend processes...")
    
    # 1. Initialize the database
    print("[INFO] Initializing database...")
    initialize_database()
    
    # 2. Load data from CSV
    # In a real scenario, you would uncomment the download_csv call
    # from data_loader import download_csv
    # download_csv(MELATE_RETRO_URL, TEST_CSV_PATH)
    print(f"[INFO] Loading data from {TEST_CSV_PATH}...")
    load_data_from_csv(TEST_CSV_PATH)
    
    # 3. Analyze and update Omega Class
    print("[INFO] Starting Omega Class analysis...")
    analizar_y_actualizar_clase_omega()
    
    print("[INFO] Backend processes finished successfully.")

if __name__ == '__main__':
    main()
