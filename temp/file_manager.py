import requests

def download_csv(url: str, output_path: str):
    """
    Descarga un archivo CSV desde una URL proporcionada.

    Args:
        url (str): URL del archivo CSV a descargar.
        output_path (str): archivo CSV para guardar la información.

    Returns:
        bytes: Contenido del archivo CSV.

    Raises:
        Exception: Si el archivo no se puede descargar o el servidor responde con un error.
    """
    try:
        # Realiza una solicitud HTTP GET a la URL proporcionada, sin verificación SSL
        response = requests.get(url, timeout=10, verify=False)

        # Verifica si el código de estado HTTP indica éxito (200)
        # Si no, levanta una excepción HTTPError
        response.raise_for_status()

        with open(output_path, "wb") as file:
            file.write(response.content)
        print(f"[INFO] Archivo descargado desde {url} a {output_path}")

    except Exception as e:
        print(f"[ERROR] No se pudo descargar el archivo desde {url}: {e}")
        raise


