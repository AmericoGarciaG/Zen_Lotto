# backend/database.py
import sqlite3
from .config import DATABASE_NAME

def initialize_database():
    """Initializes the database and creates the necessary tables."""
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()

    # Create table for Melate Retro
    c.execute('''
        CREATE TABLE IF NOT EXISTS melate_retro (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            concurso INTEGER,
            fecha TEXT,
            r1 INTEGER,
            r2 INTEGER,
            r3 INTEGER,
            r4 INTEGER,
            r5 INTEGER,
            r6 INTEGER,
            bolsa_inicial REAL,
            gan_1er_lugar INTEGER,
            premio_1er_lugar REAL,
            gan_2do_lugar INTEGER,
            premio_2do_lugar REAL,
            gan_3er_lugar INTEGER,
            premio_3er_lugar REAL,
            gan_4to_lugar INTEGER,
            premio_4to_lugar REAL,
            gan_5to_lugar INTEGER,
            premio_5to_lugar REAL,
            gan_6to_lugar INTEGER,
            premio_6to_lugar REAL,
            gan_7mo_lugar INTEGER,
            premio_7mo_lugar REAL,
            clase_omega INTEGER,
            UNIQUE(concurso)
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    initialize_database()
