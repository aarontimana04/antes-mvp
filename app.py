"""Streamlit entrypoint; collect events through a private persistent registry."""
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components
from registry_client import RegistryClient, RegistryUnavailable

ROOT = Path(__file__).resolve().parent
st.set_page_config(
    page_title="antes. — Tu primera tarjeta, con las cosas claras.",
    page_icon=str(ROOT / "public" / "favicon.svg"),
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.html("""
<style>
html, body, [data-testid="stAppViewContainer"], .stApp { background: #f7fafc; }
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

try:
    config = st.secrets.get('registry', {})
except Exception:
    config = {}
base_url = str(config.get('url', ''))
token = str(config.get('token', ''))
client = RegistryClient(base_url, token, verification=config.get('verification') is True) if base_url.startswith('https://') and token else None
snapshot = None
available = False
if client:
    try:
        snapshot = client.stats()
        available = True
    except RegistryUnavailable:
        pass

antes = components.declare_component("antes_mvp", path=str(frontend))
action = antes(
    key="antes_landing",
    default=None,
    stats=snapshot,
    available=available,
    admin_url=base_url,
    response=st.session_state.get('registry_response'),
)
if isinstance(action, dict) and action.get('request_id') and action.get('request_id') != st.session_state.get('registry_handled_request'):
    request_id = action.get('request_id')
    try:
        if not client:
            raise RegistryUnavailable()
        result = client.process(action)
        response = {'id': request_id, 'ok': True, 'stats': result}
    except ValueError as exc:
        response = {'id': request_id, 'ok': False, 'error': str(exc)}
    except RegistryUnavailable:
        response = {'id': request_id, 'ok': False, 'error': 'No pudimos confirmar el registro. Inténtalo de nuevo.'}
    st.session_state.registry_handled_request = request_id
    st.session_state.registry_response = response
    st.rerun()
