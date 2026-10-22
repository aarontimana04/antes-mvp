# antes. — MVP de una sola pantalla

Prototipo académico del Equipo 06. Presenta la promesa corregida de E6: explicar costos, fechas y pagos con ejemplos cotidianos para estudiantes de UTEC que buscan su primera tarjeta.

## Iniciar en local

```sh
npm install
npm run dev
```

Abre la dirección local que muestra Vite. Para generar la versión de producción: `npm run build`. Para verla: `npm run preview`.

## Qué permite probar

- Una pantalla con la propuesta, una ilustración animada y tres ejemplos interactivos.
- El botón **Quiero esto** registra un evento con fecha en el navegador y abre un formulario opcional de correo.
- **Prueba local**, en el pie de página, muestra los clics y correos y permite exportar los registros en JSON.
- Cada clic cuenta, incluidas repeticiones. No se mide conversión ni visitantes únicos.

Los registros se guardan exclusivamente en `localStorage`, bajo `antes-mvp-events-v1`, y persisten al recargar. No se comparten entre navegadores o dispositivos. El formulario no envía correos. Para empezar una nueva prueba, usa **Prueba local → Borrar registros de esta prueba**. Puedes exportarlos antes. Evita usar datos personales reales durante demostraciones.

Los importes y fechas son ejemplos ilustrativos; no corresponden a una oferta bancaria. La página no solicita tarjetas ni conecta cuentas. Es una propuesta estudiantil sin afiliación bancaria.

## Tecnologías

React 19, TypeScript, Vite, Lucide y CSS con diseño adaptable, animaciones, manejo del foco y soporte para movimiento reducido. Las fuentes de Google son opcionales: si no hay conexión se usan fuentes del sistema.

La identidad visual usa cian, negro y blanco, con referencias a UTEC y Lima, Perú. Paleta inspirada en [UTEC Store](https://store.utec.edu.pe/nosotros), conservando la marca propia `antes.`. Es un proyecto académico independiente.

## Streamlit

La versión de Streamlit conserva la página React como componente con altura adaptable. No añade almacenamiento compartido.

```sh
npm ci
npm run build:streamlit
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/streamlit run app.py
```

Para Streamlit Community Cloud, selecciona este repositorio, rama `main` y archivo `app.py`. `streamlit_frontend/` contiene los archivos compilados y se versiona para que Cloud no necesite Node. Después de modificar React, vuelve a ejecutar `npm run build:streamlit` y publica también los archivos compilados.
