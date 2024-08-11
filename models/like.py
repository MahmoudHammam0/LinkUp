#!/usr/bin/python3
""" Like module """
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base_model import BaseModel, Base


class Like(BaseModel, Base):
    """ Like class """
    __tablename__ = 'likes'

    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    post_id = Column(String(60), ForeignKey('posts.id'), nullable=False)