from fastapi import FastAPI
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from services.game_processor import update_all_games
from utils.db import init_db
#from utils.models import Game
from utils.logger import logger
import os

# Inicializa la aplicación FastAPI
# uvicorn main:app --reload --lifespan on --log-level debug
app = FastAPI(title="LottoInsights API", version="1.0.0")

scheduler = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manejador de eventos de vida útil de la aplicación.
    Procesa los datos de todos los juegos al iniciar la aplicación.
    """
    global scheduler
    logger.debug("Iniciando el ciclo de vida de la aplicación")

    try:
        # Inicializar la base de datos
        logger.debug("Llamando init_db()")
        init_db()

        # Verificar o crear el directorio temporal
        TEMP_DIR = "data/temp"
        if not os.path.exists(TEMP_DIR):
            os.makedirs(TEMP_DIR)
            logger.info(f"Carpeta temporal creada en '{TEMP_DIR}'")
        else:
            logger.debug(f"Carpeta temporal ya existe en '{TEMP_DIR}'")

        # Procesar los datos iniciales de los juegos
        update_all_games()

        # Iniciar el programador de tareas
        scheduler = BackgroundScheduler()
        scheduler.add_job(update_all_games, CronTrigger(hour=0, minute=1))  # Ejecuta todos los días a las 00:01
        scheduler.start()
        logger.info("Scheduler iniciado para actualizar concursos diariamente.")

    except Exception as e:
        logger.error(f"Error durante la inicialización del ciclo de vida: {e}", exc_info=True)
        raise  # Re-lanza el error para que el servidor lo maneje si es crítico

    yield  # Permite que la aplicación se inicie

    # Código que se ejecutará al finalizar la aplicación
    logger.info("Finalizando el ciclo de vida de la aplicación")
    if scheduler:
        scheduler.shutdown()
        logger.info("Scheduler detenido.")

# Configura el manejador de lifespan
app.router.lifespan_context = lifespan

@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de Loterías"}
