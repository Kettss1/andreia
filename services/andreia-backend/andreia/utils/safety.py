import hashlib
import os
import uuid


def generate_salt():
    return os.urandom(32)


def generate_password(password: str, salt: bytes):
    return hashlib.pbkdf2_hmac(
        hash_name='sha256',
        password=password.encode('utf-8'),
        salt=salt,
        iterations=122381,
        dklen=128
    )


def generate_random_token():
    return hashlib.sha256(str(uuid.uuid4()).encode('utf-8')).hexdigest()
