from sqlalchemy import create_engine

engine = create_engine('postgresql+psycopg2://postgres:postgrespassword@127.0.0.0:5433/andreia')