from .settings import *

# Relax throttling for test runs (keep scopes so view-specific throttles don't crash)
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    'DEFAULT_THROTTLE_RATES': {
        'login': '10000/min',
        'register': '10000/min',
        'jwt': '10000/min',
        'anon': '10000/min',
        'user': '10000/min',
    },
}

# Speed up password hashing in tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Keep DEBUG enabled for test tracebacks
DEBUG = True

# Allow all hosts in tests
ALLOWED_HOSTS = ['*']
