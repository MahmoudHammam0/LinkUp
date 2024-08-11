#!/usr/bin/python3
""" Post module """
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base_model import BaseModel, Base


class Post(BaseModel, Base):
    """ Post class """
    __tablename__ = 'posts'

    title = Column(String(128), nullable=False)
    content = Column(String(5000), nullable=False)
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)

    # One-to-many relationship with comments
    comments = relationship('Comment', backref='post')

    # One-to-many relationship with likes
    likes = relationship('Like', backref='post')