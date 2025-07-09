from utils.db import get_db_session
from utils.file_manager import download_csv
from utils.models import Contest, Game
from services.contest_manager import validate_csv
from utils.logger import logger
import os
from datetime import datetime

def process_game(game_id, game_url):
    """
    Procesa un juego específico: descarga el archivo CSV, lo valida y lo convierte a datos estructurados.

    :param game_id: ID del juego que se está procesando.
    :param game_url: URL de descarga del archivo CSV del juego.
    :return: Lista de registros estructurados extraídos del archivo CSV.
    """
    TEMP_DIR = "data/temp"
    temp_file = f"{TEMP_DIR}/{game_id}.csv"

    # Descargar el archivo CSV
    download_csv(game_url, temp_file)

    # Validar el archivo
    try:
        validation_result = validate_csv(temp_file)
        rows = validation_result.get("rows", [])

        if not isinstance(rows, list):
            raise ValueError(f"La salida de validate_csv no contiene una lista en 'rows': {type(rows)}")

        # Transformar los registros al formato esperado por la base de datos
        transformed_rows = []
        for row in rows:
            common = row.get("common", {})
            numbers = ",".join(row.get("numbers", []))
            additional = row.get("additional", {})

            # Convertir fecha a objeto datetime.date
            date_str = common.get("FECHA")
            date_obj = datetime.strptime(date_str, "%d/%m/%Y").date() if date_str else None

            transformed_rows.append({
                "id": common.get("CONCURSO"),
                "game_id": additional.get("NPRODUCTO"),
                "date": date_obj,
                "numbers": numbers,
                "prize": common.get("BOLSA"),
            })

        rows = transformed_rows

        if not all(isinstance(row, dict) for row in rows):
            raise ValueError("Cada registro transformado debe ser un diccionario.")

    except Exception as e:
        logger.error(f"Validación fallida para {game_id}: {e}")
        return []

    # Borrar archivo temporal después del procesamiento
    if os.path.exists(temp_file):
        os.remove(temp_file)

    logger.info(f"Juego {game_id} procesado con {len(rows)} registros.")
    return rows

def update_all_games():
    """
    Actualiza todos los concursos descargando los datos de los juegos desde sus URLs.
    """
    # Procesar los datos iniciales de los juegos
    session = next(get_db_session())            # Ver docs
    try:
        games = session.query(Game).all()       # Extrae del catálogo todos los tipos de juego.

        for game in games:
            game_id = game.game_id
            url = game.csv_url                  # La URL para descargar las estadísticas del juego. 

            # Procesar el juego
            rows = process_game(game_id, url)   # Ver docs
            if rows:
                update_database(rows, session)  # Actualiza en la BD los nuevos registros de los juegos.

        logger.info("BD de datos actualizada con los nuevos concursos.")
    except Exception as e:
        logger.error(f"Error al actualizar los juegos: {e}", exc_info=True)
    finally:
        session.close()

def update_database(data, session):
    """
    Inserta o actualiza los datos en la base de datos.

    :param data: Lista de registros procesados.
    :param session: Sesión de base de datos abierta.
    """
    try:
        for record in data:
            if not isinstance(record, dict):
                logger.error(f"Registro inválido: {record}. Debe ser un diccionario.")
                continue

            contest_id = record.get("id")
            game_id = record.get("game_id")

            if not contest_id or not game_id:
                logger.error(f"Registro incompleto: {record}")
                continue

            # Verificar si el registro ya existe
            exists = session.query(Contest).filter_by(id=contest_id, game_id=game_id).first()

            if exists:
                # Actualizar registro existente
                exists.date = record.get("date")
                exists.numbers = record.get("numbers")
                exists.prize = record.get("prize")
                logger.debug(f"Actualizando concurso existente: {contest_id}, juego: {game_id}")
            else:
                # Insertar nuevo registro
                new_contest = Contest(**record)
                session.add(new_contest)
                logger.debug(f"Insertando nuevo concurso: {contest_id}, juego: {game_id}")

        session.commit()
        logger.info(f"Base de datos actualizada con {len(data)} registros.")
    except Exception as e:
        session.rollback()
        logger.error(f"Falló la actualización de la base de datos: {e}", exc_info=True)
        raise
