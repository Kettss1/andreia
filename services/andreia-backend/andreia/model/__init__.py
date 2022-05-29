from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    __table_name__ = 'user'

    id = Column('id', Integer, primary_key=True)
    name = Column('name', String, nullable=False, unique=True)
    password = Column('password', String, nullable=False)
    email = Column('email', String, nullable=False)
    restaurants = relationship('Restaurant')


class Restaurant(Base):
    __table_name__ = 'restaurant'

    id = Column('id', Integer, primary_key=True)
    name = Column('name', String, nullable=False, unique=True)
    description = Column('description', String)
    delivery_charge = Column('delivery_charge', Integer)
    menus = relationship('Menu')


class Menu(Base):
    __table_name__ = 'menu'

    id = Column('id', Integer, primary_key=True)
    items = relationship('MenuItem')


class MenuItem(Base):
    __table_name__ = 'menu_item'

    id = Column('id', Integer, primary_key=True)
    name = Column('name', String, nullable=False, unique=True)
    price = Column('price', Integer, nullable=False)
    category_id = Column(Integer, ForeignKey("category.id"))


class Category(Base):
    __table_name__ = 'category'

    id = Column('id', Integer, primary_key=True)
    name = Column('name', String, nullable=False)
    slug = Column('slug', String, nullable=False, unique=True)
