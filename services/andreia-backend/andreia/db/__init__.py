from sqlalchemy import create_engine

andreia_db_engine = create_engine('postgresql+psycopg2://postgres:postgrespassword@127.0.0.1:5433/andreia')