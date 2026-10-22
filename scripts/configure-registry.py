"""Read registry credentials from hidden stdin; never print secret values."""
import json
import os
from pathlib import Path
import sys
import termios

if sys.stdin.isatty():
    state = termios.tcgetattr(sys.stdin)
    state[3] &= ~termios.ECHO
    termios.tcsetattr(sys.stdin, termios.TCSANOW, state)
print('Ready for registry configuration on hidden stdin.', flush=True)
data = json.loads(sys.stdin.readline())
assert isinstance(data.get('url'), str) and data['url'].startswith('https://')
assert isinstance(data.get('token'), str) and data['token']
target = Path(__file__).resolve().parent.parent / '.streamlit' / 'secrets.toml'
target.parent.mkdir(exist_ok=True)
body = '[registry]\nurl = ' + json.dumps(data['url']) + '\ntoken = ' + json.dumps(data['token']) + '\n'
descriptor = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
os.chmod(target, 0o600)
with os.fdopen(descriptor, 'w') as stream:
    stream.write(body)
print('Registry configuration saved locally with private permissions.', flush=True)
