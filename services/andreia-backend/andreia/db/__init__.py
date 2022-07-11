from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, Session
from typing import Callable

andreia_db_engine = create_engine('postgresql+psycopg2://postgres:postgrespassword@127.0.0.1:5433/andreia')

session_factory: Callable[[], Session] = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=andreia_db_engine))


def get_session():
    db: Session = session_factory()

    try:
        yield db
        db.commit()
    except:
        db.rollback()
        raise
