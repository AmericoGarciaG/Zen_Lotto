import csv
from io import StringIO
from sqlalchemy.exc import IntegrityError
from utils.db import get_db_session

def validate_csv(file_path: str) -> dict:
    """
    Valida y procesa un archivo CSV para juegos de lotería.

    Args:
        file_path (str): Ruta del archivo CSV.

    Returns:
        dict: Información procesada con encabezados dinámicos y registros.
            {
                "common_headers": ["CONCURSO", "FECHA", "BOLSA"],
                "number_headers": ["F1", "F2", "F3", ...],
                "additional_headers": ["CAMPO_EXTRA"],
                "rows": [ {...}, {...} ]
            }

    Raises:
        ValueError: Si el archivo es inválido o faltan encabezados obligatorios.
    """
    required_headers = ["CONCURSO", "FECHA", "BOLSA"]

    with open(file_path, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        # Normalizar encabezados
        normalized_headers = [header.strip().upper() for header in reader.fieldnames]
        normalized_required = [header.strip().upper() for header in required_headers]

        # Verificar encabezados comunes
        missing_headers = [h for h in normalized_required if h not in normalized_headers]
        if missing_headers:
            raise ValueError(f"Faltan encabezados obligatorios: {missing_headers}")

        # Identificar encabezados dinámicos
        number_headers = [h for h in normalized_headers if (h.startswith("F") or h.startswith("R")) and h not in ["FECHA"]]
        additional_headers = [h for h in normalized_headers if h not in normalized_required + number_headers]

        # Procesar filas
        rows = []
        for row in reader:
            processed_row = {
                "common": {key: row[key] for key in normalized_required if key in row},
                "numbers": [row[key] for key in number_headers if key in row],
                "additional": {key: row[key] for key in additional_headers if key in row}
            }
            rows.append(processed_row)

        return {
            "common_headers": normalized_required,
            "number_headers": number_headers,
            "additional_headers": additional_headers,
            "rows": rows,
        }

def insert_contests_to_db(contests: list[dict]):
    """
    Inserta los concursos validados en la base de datos.

    :param contests: Lista de diccionarios que representan los concursos validados.
    """
    session = get_db_session()
    try:
        for contest in contests:
            session.execute("""
                INSERT INTO contests (id, game_id, date, numbers, prize)
                VALUES (:id, :game_id, :date, :numbers, :prize)
                ON CONFLICT(id, game_id) DO NOTHING
            """, contest)
        session.commit()
    except IntegrityError as e:
        session.rollback()
        raise Exception(f"Error al insertar concursos: {e}")
    finally:
        session.close()