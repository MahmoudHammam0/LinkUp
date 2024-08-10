#!/usr/bin/python3
""" BaseModel class module """
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime
import datetime
import uuid
import models

Base = declarative_base()


class BaseModel:
    """ Defines all common attributes/methods for other classes """
    id = Column(String(60), unique=True, nullable=False, primary_key=True)
    created_at = Column(DateTime, nullable=False,
                        default=(datetime.datetime.utcnow()))
    updated_at = Column(DateTime, nullable=False,
                        default=(datetime.datetime.utcnow()))

    def __init__(self, *args, **kwargs):
        """ initialization """
        self.id = str(uuid.uuid4())
        self.created_at = datetime.datetime.now()
        self.updated_at = datetime.datetime.now()

        if kwargs != {}:
            for key, value in kwargs.items():
                if key != '__class__':
                    setattr(self, key, value)
                if key == 'created_at':
                    self.created_at = datetime.datetime.fromisoformat(value)
                if key == 'updated_at':
                    self.updated_at = datetime.datetime.fromisoformat(value)
                if 'id' not in kwargs.keys():
                    setattr(self, 'id', str(uuid.uuid4()))
                if 'created_at' not in kwargs.keys():
                    setattr(self, 'created_at', datetime.datetime.now())
                if 'updated_at' not in kwargs.keys():
                    setattr(self, 'updated_at', datetime.datetime.now())

    def __str__(self):
        """ defines how the model should be represented as a string """
        new_dict = {}
        # removes the '_sa_instance_state' key from the dict in case it's still there
        for key, value in self.__dict__.items():
            if key != '_sa_instance_state' and key != 'created_at' and key != 'updated_at':
                new_dict[key] = value
        return ("[{}] ({}) {}".format(self.__class__.__name__,
                                      self.id, new_dict))

    def save(self):
        """ updates the attribute updated_at with the current datetime """
        self.updated_at = datetime.datetime.now()
        models.storage.new(self)
        models.storage.save()

    def to_dict(self):
        """ returns a dictionary containing all keys/values of the instance """
        res = self.__dict__.copy()
        if '_sa_instance_state' in res:
            del res['_sa_instance_state']
        res['created_at'] = res['created_at'].isoformat()
        res['updated_at'] = res['updated_at'].isoformat()
        res['__class__'] = self.__class__.__name__
        return res

    def delete(self):
        """ deletes the current instance from the storage """
        models.storage.delete(self)