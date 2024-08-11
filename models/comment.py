#!/usr/bin/python3
""" Comment module """
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base_model import BaseModel, Base


class Comment(BaseModel, Base):
    """ Comment class """
    __tablename__ = 'comments'

    content = Column(String(5000), nullable=False)
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    post_id = Column(String(60), ForeignKey('posts.id'), nullable=False)