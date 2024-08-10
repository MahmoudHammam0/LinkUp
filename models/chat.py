#!/usr/bin/python3
""" Chat module """
from sqlalchemy import Column, ForeignKey, Table, String
from sqlalchemy.orm import relationship
from models.base_model import BaseModel, Base


chat_users = Table(
    'chat_user',
    Base.metadata,
    Column('chat_id', String(60), ForeignKey('chats.id'), primary_key=True),
    Column('user_id', String(60), ForeignKey('users.id'), primary_key=True)
)


class Chat(BaseModel, Base):
    """ Chat class """
    __tablename__ = 'chats'

    users = relationship('User', secondary=chat_users, back_populates='chats')

    # One-to-many relationship with messages
    messages = relationship('Message', backref='chat')

    
    def add_users(self, users_ids):
        "take a list of users ids and check them then add them to chat"
        from models import storage
        from models.user import User
        for user_id in users_ids:
            user = storage.get(User, user_id)
            if not user:
                raise ValueError('User does not exist')
            if user not in self.users:
                self.users.append(user)
        self.save()