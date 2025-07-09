from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from utils.models import Base
from utils.models import Game
from utils.logger import logger
import os 

# Configuración de la ruta de la base de datos
DATABASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data") # Ruta al directorio raíz del proyecto (un nivel arriba del directorio actual)
DATABASE_PATH = os.path.join(DATABASE_DIR, "database.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
logger.debug("Ruta de BD a configurar: %s ", DATABASE_URL)


# Verificar y crear la carpeta "data" si no existe
if not os.path.exists(DATABASE_DIR):
    os.makedirs(DATABASE_DIR)
    logger.info(f"Carpeta '{DATABASE_DIR}' creada.")
else:
    logger.debug(f"Carpeta '{DATABASE_DIR}' ya existe.")

# engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
# SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

try:
    # Inicialización del engine
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

    # Inicialización de la sesión
    SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
    
    # Confirmar conexión
    with engine.connect() as connection:
        logger.info("Conexión a la base de datos establecida con éxito.")

except Exception as e:
    logger.error("Falló la configuración de la base de datos: %s", e, exc_info=True)
    raise  # Re-lanza la excepción para no ocultarla

def get_db_session():
    """
    Obtiene una sesión de base de datos para realizar operaciones.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Crea todas las tablas en la base de datos utilizando los modelos definidos
    y llena el catálogo inicial de juegos.
    """
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        # Verificar si ya existen registros en la tabla `games`
        if not session.query(Game).first():
            # Insertar registros iniciales
            initial_games = [
                {
                    "game_id": 40,
                    "name": "Melate",
                    "csv_url": "https://www.loterianacional.gob.mx/Home/Historicos?ARHP=TQBlAGwAYQB0AGUA"
                }
            ]
            for game in initial_games:
                session.add(Game(**game))
            session.commit()
            logger.info(f"Catálogo de juegos inicial creado con {len(initial_games)} registros.")
        else:
            logger.info("Catálogo de juegos ya existe. No se realizó ningún cambio.")
    except Exception as e:
        session.rollback()
        logger.error(f"Error al insertar juegos iniciales: {e}", exc_info=True)
    finally:
        session.close()


def setup_test_db():
    """
    Configura una base de datos limpia para pruebas unitarias.
    """
    from sqlalchemy import MetaData
    metadata = MetaData()
    metadata.drop_all(bind=engine)  # Elimina todas las tablas existentes
    metadata.create_all(bind=engine)  # Vuelve a crear las tablas definidas en los modelos