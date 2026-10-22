"""Private durable registry client. Credentials never leave the Python server."""
import json
import re
import uuid
from urllib.error import HTTPError, URLError
from urllib.request import Request, HTTPRedirectHandler, build_opener


class RegistryUnavailable(Exception):
    pass


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise RegistryUnavailable()


class RegistryClient:
    def __init__(self, base_url: str, token: str, verification: bool = False):
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.verification = verification
        self._opener = build_opener(NoRedirect())

    def _request(self, path: str, payload=None):
        body = json.dumps(payload).encode() if payload is not None else None
        headers = {
            'OAI-Sites-Authorization': 'Bearer ' + self.token,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        if self.verification:
            headers['X-Registry-Verification'] = '1'
        request = Request(self.base_url + path, data=body, headers=headers)
        for attempt in range(2):
            try:
                with self._opener.open(request, timeout=6) as response:
                    result = json.load(response)
                if not isinstance(result, dict):
                    raise RegistryUnavailable()
                return result
            except HTTPError as exc:
                if exc.code < 500 or attempt:
                    raise RegistryUnavailable() from None
            except (URLError, TimeoutError, ValueError, OSError):
                if attempt:
                    raise RegistryUnavailable() from None
        raise RegistryUnavailable()

    def stats(self):
        data = self._request('/api/stats')
        if not all(isinstance(data.get(key), (int, float)) and data[key] >= 0 for key in ('clicks', 'emails', 'submissions')):
            raise RegistryUnavailable()
        return data

    def process(self, action):
        if not isinstance(action, dict):
            raise ValueError('Solicitud inválida.')
        event_id = str(action.get('id', ''))
        try:
            if str(uuid.UUID(event_id)) != event_id:
                raise ValueError()
        except ValueError:
            raise ValueError('Identificador inválido.') from None
        kind = action.get('type')
        if kind == 'refresh':
            return self.stats()
        if kind not in ('interest', 'email'):
            raise ValueError('Evento inválido.')
        payload = {'id': event_id, 'type': kind}
        if kind == 'email':
            email = str(action.get('email', '')).strip().lower()
            if len(email) > 254 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
                raise ValueError('Ingresa un correo válido.')
            payload['email'] = email
        result = self._request('/api/events', payload)
        if result.get('ok') is not True or result.get('id') != event_id or not isinstance(result.get('stats'), dict):
            raise RegistryUnavailable()
        return result['stats']
