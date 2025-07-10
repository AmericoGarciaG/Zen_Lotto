# backend/data_loader.py
import csv
import sqlite3
import requests
from .config import DATABASE_NAME, MELATE_RETRO_URL, TEST_CSV_PATH

def download_csv(url: str, output_path: str):
    """Downloads a CSV file from a given URL."""
    try:
        response = requests.get(url, timeout=10, verify=False)
        response.raise_for_status()
        with open(output_path, "wb") as file:
            file.write(response.content)
        print(f"[INFO] File downloaded from {url} to {output_path}")
    except Exception as e:
        print(f"[ERROR] Could not download file from {url}: {e}")
        raise

def load_data_from_csv(csv_path: str):
    """Loads data from a CSV file into the database."""
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                concurso = int(row['concurso'])
                # Check if the record already exists
                c.execute("SELECT id FROM melate_retro WHERE concurso = ?", (concurso,))
                if c.fetchone():
                    continue

                # Insert new record
                c.execute("""
                    INSERT INTO melate_retro (
                        concurso, fecha, r1, r2, r3, r4, r5, r6,
                        bolsa_inicial, gan_1er_lugar, premio_1er_lugar,
                        gan_2do_lugar, premio_2do_lugar, gan_3er_lugar,
                        premio_3er_lugar, gan_4to_lugar, premio_4to_lugar,
                        gan_5to_lugar, premio_5to_lugar, gan_6to_lugar,
                        premio_6to_lugar, gan_7mo_lugar, premio_7mo_lugar,
                        clase_omega
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    concurso, row['fecha'], int(row['r1']), int(row['r2']),
                    int(row['r3']), int(row['r4']), int(row['r5']), int(row['r6']),
                    float(row['bolsa_inicial']), int(row['gan_1er_lugar']),
                    float(row['premio_1er_lugar']), int(row['gan_2do_lugar']),
                    float(row['premio_2do_lugar']), int(row['gan_3er_lugar']),
                    float(row['premio_3er_lugar']), int(row['gan_4to_lugar']),
                    float(row['premio_4to_lugar']), int(row['gan_5to_lugar']),
                    float(row['premio_5to_lugar']), int(row['gan_6to_lugar']),
                    float(row['premio_6to_lugar']), int(row['gan_7mo_lugar']),
                    float(row['premio_7mo_lugar']), -1 # Default value for clase_omega
                ))
            except (ValueError, KeyError) as e:
                print(f"[ERROR] Skipping row due to missing or invalid data: {row} - {e}")
                continue

    conn.commit()
    conn.close()

if __name__ == '__main__':
    # For testing purposes, we'll use the local CSV file.
    # In production, you would call download_csv first.
    # download_csv(MELATE_RETRO_URL, TEST_CSV_PATH)
    load_data_from_csv(TEST_CSV_PATH)
