from decimal import Decimal

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from andreia.model.base import PrimaryKeyMixin, SlugMixin

Base = declarative_base()


class User(Base, PrimaryKeyMixin):
    name = Column(String, nullable=False, unique=True)
    # Login with email, so, e-mail must be unique
    email = Column(String, nullable=False, unique=True)

    # TODO: Estudar porque https://stackoverflow.com/a/9595108
    #  exemplo implementacao em scratch.py
    #  testar esse fluxo de
    #  - desenvolver pequenas POCs em SCRATCH_XX.PY
    #  - brincar com o python live no botao Python Console (ao lado de TOD0)
    password = Column(String, nullable=False)
    password_salt = Column(String, nullable=False)
    restaurants = relationship('Restaurant')

    # TODO: Implementar funcoes:
    #  - Setpassword
    #  - Checkpassword
    #  Ambas recebem uma string e settam os campos adequados, OU comparam (fazem o calculo reverso)


class Restaurant(Base, PrimaryKeyMixin, SlugMixin):
    user_id = Column(PrimaryKeyMixin.id.type, ForeignKey('user.id'), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    delivery_charge = Column(Decimal)
    menus = relationship('Menu')


class Menu(Base, PrimaryKeyMixin, SlugMixin):
    name = Column(String, nullable=False)
    restaurant_id = Column(PrimaryKeyMixin.id.type, ForeignKey('restaurant.id'), nullable=False)
    restaurant: Restaurant = relationship(Restaurant)
    sections = relationship('MenuSection')


class MenuSection(Base, PrimaryKeyMixin, SlugMixin):
    menu_id = Column(PrimaryKeyMixin.id.type, ForeignKey('menu.id'), nullable=False)
    menu: Menu = relationship(Menu)
    name = Column(String, nullable=False)
    # Section position
    index = Column(Integer, nullable=False)
    items = relationship('MenuItem')


class MenuItem(Base, PrimaryKeyMixin, SlugMixin):
    section = relationship('MenuSection')
    name = Column(String, nullable=False, unique=True)
    price = Column(Decimal, nullable=False)
    section_id = Column(PrimaryKeyMixin.id.type, ForeignKey("menusection.id"))
    index = Column(Integer, nullable=False)
