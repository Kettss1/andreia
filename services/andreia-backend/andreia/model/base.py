import uuid

from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declared_attr, declarative_base

Base = declarative_base()


class PrimaryKeyMixin:
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    id = Column('id', Integer, primary_key=True, )


class SlugMixin:
    # TODO: Add random string to the end so that you never hit uniqueness constraints
    slug = Column(String, nullable=False, unique=True)
