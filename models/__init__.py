#!/usr/bin/python3
""" Initialization module for the models package """
from models.engine.db_storage import DBStorage


storage = DBStorage()
storage.reload()