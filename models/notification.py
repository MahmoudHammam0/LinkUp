#!/usr/bin/python3
""" Notification module """
from sqlalchemy import Boolean, Column, ForeignKey, String
from models.base_model import BaseModel, Base

class Notification(BaseModel, Base):
    """ Notification class """
    __tablename__ = 'notifications'

    content = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    read = Column(Boolean, default=False)

    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)