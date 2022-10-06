from andreia.db import get_session


class BaseQueryController:
    def __init__(self, db_session=get_session()):
        self.session = db_session
