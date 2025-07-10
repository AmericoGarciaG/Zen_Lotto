# backend/omega_analyzer.py
import sqlite3
from .omega_data import FREQ_PARES, FREQ_TERCIAS, FREQ_CUARTETOS
from .config import DATABASE_NAME

# Omega criteria thresholds
UMBRAL_PARES = 459
UMBRAL_TERCIAS = 74
UMBRAL_CUARTETOS = 10

def calcular_afinidad_pares(combinacion):
    afinidad = 0
    for i in range(len(combinacion)):
        for j in range(i + 1, len(combinacion)):
            par = f"({min(combinacion[i], combinacion[j])},{max(combinacion[i], combinacion[j])})"
            afinidad += FREQ_PARES.get(par, 0)
    return afinidad

def calcular_afinidad_tercias(combinacion):
    afinidad = 0
    for i in range(len(combinacion)):
        for j in range(i + 1, len(combinacion)):
            for k in range(j + 1, len(combinacion)):
                tercia = tuple(sorted((combinacion[i], combinacion[j], combinacion[k])))
                key = str(tercia).replace(" ", "")
                afinidad += FREQ_TERCIAS.get(key, 0)
    return afinidad

def calcular_afinidad_cuartetos(combinacion):
    afinidad = 0
    for i in range(len(combinacion)):
        for j in range(i + 1, len(combinacion)):
            for k in range(j + 1, len(combinacion)):
                for l in range(k + 1, len(combinacion)):
                    cuarteto = tuple(sorted((combinacion[i], combinacion[j], combinacion[k], combinacion[l])))
                    key = str(cuarteto).replace(" ", "")
                    afinidad += FREQ_CUARTETOS.get(key, 0)
    return afinidad

def es_clase_omega(combinacion):
    afinidad_pares = calcular_afinidad_pares(combinacion)
    if afinidad_pares < UMBRAL_PARES:
        return 0
    
    afinidad_tercias = calcular_afinidad_tercias(combinacion)
    if afinidad_tercias < UMBRAL_TERCIAS:
        return 0
    
    afinidad_cuartetos = calcular_afinidad_cuartetos(combinacion)
    return 1 if afinidad_cuartetos >= UMBRAL_CUARTETOS else 0

def analizar_y_actualizar_clase_omega():
    """Analyzes all records in the database and updates the clase_omega field."""
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()
    c.execute("SELECT id, r1, r2, r3, r4, r5, r6 FROM melate_retro")
    rows = c.fetchall()

    for row in rows:
        id, r1, r2, r3, r4, r5, r6 = row
        combinacion = [r1, r2, r3, r4, r5, r6]
        clase_omega = es_clase_omega(combinacion)
        c.execute("UPDATE melate_retro SET clase_omega = ? WHERE id = ?", (clase_omega, id))

    conn.commit()
    conn.close()
    print("[INFO] Omega Class analysis and database update complete.")

if __name__ == '__main__':
    analizar_y_actualizar_clase_omega()
