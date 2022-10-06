#!/usr/bin/env python

import click
import uvicorn

from andreia.db import andreia_db_engine
from andreia.model import Base
from andreia.api import app
from andreia.utils.SampleUsers import insert_sample_users


@click.group()
def cli():
    print(f"Andreia CLI")


@cli.command()
def drop_tables():
    print(f"Dropping tables")
    andreia_db_metadata = Base.metadata
    andreia_db_metadata.drop_all(andreia_db_engine)


@cli.command()
def create_tables():
    print(f"Creating tables")
    andreia_db_metadata = Base.metadata
    andreia_db_metadata.create_all(andreia_db_engine)


@cli.command()
def recreate_database():
    print(f"Recreating tables")
    drop_tables()
    create_tables()


@cli.command()
def insert_new_users():
    print(f'Inserting users into "user" table')
    insert_sample_users(andreia_db_engine)


@cli.command()
def run_api():
    uvicorn.run(app)


if __name__ == '__main__':
    cli()
