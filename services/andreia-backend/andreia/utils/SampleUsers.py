from typing import Union

from sqlalchemy.engine import Engine, Connection
from sqlalchemy.orm import sessionmaker

from andreia.model import User


def insert_sample_users(connectable: Union[Connection, Engine]):
    session = sessionmaker(bind=connectable)()

    new_user = User(
        id=1,
        name='ket',
        email='ket@example.com'
    )

    new_user.set_password('123')

    session.add(new_user)
    session.commit()
    session.close()

