#!/usr/bin/python3
""" Chat module """
from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from models.base_model import BaseModel, Base

# many-to-many relationship table for chats and users
chat_users = Table(
    'chat_user',
    Base.metadata,
    Column('chat_id', Integer, ForeignKey('chats.id'), primary_key=True, nullable=False),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True, nullable=False)
)

class Chat(BaseModel, Base):
    """ Chat class """
    __tablename__ = 'chats'

    # Many-to-many relationship with users
    users = relationship('User', secondary=chat_users, backref='chats')

    # One-to-many relationship with messages
    messages = relationship('Message', backref='chat')