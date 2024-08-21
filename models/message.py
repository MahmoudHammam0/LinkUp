#!/usr/bin/python3
""" Message module """
from models.base_model import BaseModel, Base
from sqlalchemy import Column, String, ForeignKey, Boolean


class Message(BaseModel, Base):
    "messages table"
    __tablename__ = 'messages'
    content = Column(String(5000), nullable=False)
    sender_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    chat_id = Column(String(60), ForeignKey('chats.id'), nullable=False)
    read = Column(Boolean, default=False)