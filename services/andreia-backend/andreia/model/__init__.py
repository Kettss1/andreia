from sqlalchemy import Column, Integer, String, ForeignKey, Numeric
from sqlalchemy.orm import relationship

from andreia.model.base import PrimaryKeyMixin, SlugMixin, Base
from andreia.utils.safety import generate_salt, generate_password, generate_random_token


class User(Base, PrimaryKeyMixin):
    name = Column(String, nullable=False, unique=True)
    # Login with email, so, e-mail must be unique
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    password_salt = Column(String, nullable=False)
    restaurants = relationship('Restaurant')

    def set_password(self, password):
        self.password_salt = generate_salt()
        self.password = generate_password(password, self.password_salt)

    def check_password(self, password):
        return generate_password(password, self.password_salt) == self.password


class AuthToken(Base, PrimaryKeyMixin):
    token = Column(String, nullable=False, unique=True)
    user_id = Column(PrimaryKeyMixin.id.type, ForeignKey('user.id'), nullable=False)
    user = relationship('User')
    user: User

    def generate_token(self):
        self.token = generate_random_token()
        return self


class Restaurant(Base, PrimaryKeyMixin, SlugMixin):
    user_id = Column(PrimaryKeyMixin.id.type, ForeignKey('user.id'), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    delivery_charge = Column(Numeric)
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
    price = Column(Numeric, nullable=False)
    section_id = Column(PrimaryKeyMixin.id.type, ForeignKey("menusection.id"))
    index = Column(Integer, nullable=False)
