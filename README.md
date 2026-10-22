# antes. — MVP del Equipo 06

Página académica para estudiantes de UTEC: entender costos, fechas y pagos antes de solicitar su primera tarjeta. React 19, TypeScript, Vite y Streamlit. Identidad visual en cian, negro y blanco inspirada en [UTEC Store](https://store.utec.edu.pe/nosotros).

## Registro global

- **Quiero esto** guarda un clic en el registro central y confirma únicamente después de recibir respuesta del servidor.
- El correo es opcional y se guarda con fecha en la base persistente.
- Los clics repetidos cuentan. Los correos se normalizan y el contador muestra correos únicos; también se conserva el número de envíos.
- Cada evento tiene un ID para evitar duplicados por reintentos o recargas.
- **Resultados globales** muestra los contadores de todos los dispositivos. Se actualizan al abrir el panel o pulsar **Actualizar contadores**.
- **Ver correos y descargar Excel** abre el panel privado del responsable, protegido con su cuenta de ChatGPT.
- El Excel incluye **Resumen** y **Registros**, con los correos, tipos de evento, fechas en hora de Lima e identificadores.

Streamlit envía los eventos desde Python a un servicio privado de Sites con base D1. Los secretos nunca se envían al navegador ni se versionan. La base central persiste fuera del disco efímero de Streamlit. Los correos no aparecen en la página pública ni en el repositorio de GitHub.

Los datos de la versión anterior permanecen en cada navegador bajo `antes-mvp-events-v1`; no se importan ni borran automáticamente. El registro central empieza con su activación. No se envían correos automáticos ni se solicitan tarjetas.

## Uso local con registro global

```sh
npm ci
npm run build:streamlit
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/streamlit run app.py
```

Configura `.streamlit/secrets.toml` siguiendo `.streamlit/secrets.example.toml`. Nunca publiques ese archivo. En Streamlit Community Cloud usa **Settings > Secrets**. Si la conexión falla se muestra un error y no se anuncia que el dato quedó guardado.

`npm run dev` abre la vista de diseño en Vite. Para registrar datos utiliza Streamlit, ya que la conexión privada se realiza en Python.

## Publicación

El punto de entrada de Community Cloud es `app.py`, rama `main`. `streamlit_frontend/` se versiona compilado para que Cloud no necesite Node. Después de cambiar React ejecuta `npm run build:streamlit` y publica también esos archivos.

El servicio de almacenamiento tiene su propio repositorio privado de Sites. El directorio local `services/registro/` está excluido del repositorio público y contiene su esquema, migraciones y pruebas de desarrollo.

## Verificación

`tests/test_registry.py` se ejecuta únicamente contra un registro de desarrollo en `http://127.0.0.1:8582`. Comprueba concurrencia, idempotencia, validación, correos únicos y estructura del Excel. Las verificaciones remotas usan eventos marcados de prueba, excluidos de los contadores reales y de la exportación.
