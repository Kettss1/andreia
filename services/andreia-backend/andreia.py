#!/usr/bin/env python

import click
import uvicorn

from andreia.db import andreia_db_engine
from andreia.model import Base
from andreia.api import app


@click.group()
def cli():
    print(f"Andreia CLI")


@cli.command()
def drop_tables():
    andreia_db_metadata = Base.metadata
    andreia_db_metadata.drop_all(andreia_db_engine)


@cli.command()
def create_tables():
    andreia_db_metadata = Base.metadata
    andreia_db_metadata.create_all(andreia_db_engine)


@cli.command()
def recreate_database():
    drop_tables()
    create_tables()


@cli.command()
def run_api():
    uvicorn.run(app)


if __name__ == '__main__':
    cli()
