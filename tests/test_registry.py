"""Run against the isolated local registry: python -m unittest discover -s tests."""
import io
import json
import unittest
import uuid
import zipfile
from concurrent.futures import ThreadPoolExecutor
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

BASE = 'http://127.0.0.1:8582'


def request(path, payload=None, verification=True):
    headers = {'Content-Type': 'application/json'}
    if verification:
        headers['X-Registry-Verification'] = '1'
    data = json.dumps(payload).encode() if payload is not None else None
    with urlopen(Request(BASE + path, data=data, headers=headers), timeout=15) as response:
        content = response.read()
        return content if path == '/api/export' else json.loads(content)


class RegistryTests(unittest.TestCase):
    def test_concurrent_retries_are_idempotent(self):
        before = request('/api/stats')
        event = {'id': str(uuid.uuid4()), 'type': 'interest'}
        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _: request('/api/events', event), range(12)))
        self.assertTrue(all(result['ok'] for result in results))
        self.assertEqual(request('/api/stats')['clicks'], before['clicks'] + 1)

    def test_distinct_devices_accumulate(self):
        before = request('/api/stats')
        with ThreadPoolExecutor(max_workers=6) as pool:
            list(pool.map(lambda _: request('/api/events', {'id': str(uuid.uuid4()), 'type': 'interest'}), range(12)))
        self.assertEqual(request('/api/stats')['clicks'], before['clicks'] + 12)

    def test_unique_email_and_submission_counts(self):
        before = request('/api/stats')
        email = 'qa-' + uuid.uuid4().hex + '@example.com'
        for value in (email.upper(), ' ' + email + ' '):
            request('/api/events', {'id': str(uuid.uuid4()), 'type': 'email', 'email': value})
        after = request('/api/stats')
        self.assertEqual(after['emails'], before['emails'] + 1)
        self.assertEqual(after['submissions'], before['submissions'] + 2)

    def test_invalid_email_does_not_change_counts(self):
        before = request('/api/stats')
        with self.assertRaises(HTTPError) as error:
            request('/api/events', {'id': str(uuid.uuid4()), 'type': 'email', 'email': 'invalid'})
        self.assertEqual(error.exception.code, 400)
        after = request('/api/stats')
        self.assertEqual(before['emails'], after['emails'])

    def test_conflicting_id_is_rejected(self):
        event_id = str(uuid.uuid4())
        request('/api/events', {'id': event_id, 'type': 'interest'})
        with self.assertRaises(HTTPError) as error:
            request('/api/events', {'id': event_id, 'type': 'email', 'email': 'qa@example.com'})
        self.assertEqual(error.exception.code, 409)

    def test_excel_contains_counts_and_typed_data(self):
        marker = 'export-' + uuid.uuid4().hex + '@example.com'
        request('/api/events', {'id': str(uuid.uuid4()), 'type': 'email', 'email': marker}, verification=False)
        binary = request('/api/export', verification=False)
        with zipfile.ZipFile(io.BytesIO(binary)) as archive:
            self.assertIsNone(archive.testzip())
            for name in archive.namelist():
                ET.fromstring(archive.read(name))
            details = archive.read('xl/worksheets/sheet2.xml').decode()
            self.assertIn(marker, details)
            self.assertNotIn('<f>', details)
            self.assertIn('s="2"', details)
            self.assertIn('Correos únicos', archive.read('xl/worksheets/sheet1.xml').decode())
            self.assertIn('Registros', archive.read('xl/workbook.xml').decode())


if __name__ == '__main__':
    unittest.main()
