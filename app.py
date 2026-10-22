"""Streamlit entrypoint for the React MVP. No server-side personal data storage."""
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).resolve().parent
st.set_page_config(
    page_title="antes. — Tu primera tarjeta, con las cosas claras.",
    page_icon=str(ROOT / "public" / "favicon.svg"),
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.html("""
<style>
html, body, [data-testid="stAppViewContainer"], .stApp { background: #f6f6ef; }
[data-testid="stHeader"] { display: none; }
[data-testid="stMainBlockContainer"] { padding: 0; max-width: none; }
[data-testid="stVerticalBlock"] { gap: 0; }
[data-testid="stCustomComponentV1"] iframe { display: block; width: 100%; border: 0; }
</style>
""")

frontend = ROOT / "streamlit_frontend"
if not (frontend / "index.html").is_file():
    st.error("Falta compilar la página. Ejecuta npm ci y npm run build:streamlit.")
    st.stop()

antes = components.declare_component("antes_mvp", path=str(frontend))
antes(key="antes_landing", default=None)
