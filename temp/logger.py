import logging
from logging.handlers import RotatingFileHandler
import os


class LoggerHandler:
    def __init__(self, log_file="logs/app.log", log_to_console=True, level=logging.INFO, max_bytes=5 * 1024 * 1024, backup_count=5):
        """
        Configura un sistema de logging con rotación de archivos y salida opcional a consola.

        Args:
            log_file (str): Ruta del archivo de log.
            log_to_console (bool): Si se debe habilitar la salida a consola.
            level (int): Nivel de logging mínimo.
            max_bytes (int): Tamaño máximo del archivo antes de rotar.
            backup_count (int): Número máximo de archivos rotados.
        """
        self.logger = logging.getLogger("AppLogger")
        self.logger.setLevel(level)

        # Formato del log
        formatter = logging.Formatter('%(asctime)s [%(levelname)s] [%(filename)s:%(lineno)d] %(message)s')

        # Crear carpeta para logs si no existe
        log_dir = os.path.dirname(log_file)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        # Configuración de handler para archivo
        file_handler = RotatingFileHandler(log_file, maxBytes=max_bytes, backupCount=backup_count)
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

        # Configuración de handler para consola (opcional)
        if log_to_console:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)

    def get_logger(self):
        """Devuelve el logger configurado."""
        return self.logger


# Inicialización del logger global
logger = LoggerHandler(
    log_file="logs/app.log",  # Cambia esta ruta según sea necesario
    log_to_console=True,
    level=logging.DEBUG,  # Cambia el nivel de logging según el entorno
).get_logger()
