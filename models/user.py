#!/usr/bin/python3
""" User module """
from sqlalchemy import Column, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from flask_login import UserMixin
from models.base_model import BaseModel, Base
import bcrypt

# many-to-many relationship table for followers
user_follower = Table(
    'user_follower',
    Base.metadata,
    Column('user_id', String(60), ForeignKey('users.id'), primary_key=True),
    Column('follower_id', String(60), ForeignKey('users.id'), primary_key=True)
)

# chat_users = Table(
#     'chat_user',
#     Base.metadata,
#     Column('chat_id', String(60), ForeignKey('chats.id'), primary_key=True),
#     Column('user_id', String(60), ForeignKey('users.id'), primary_key=True)
# )

class User(BaseModel, Base, UserMixin):
    """ User class """
    __tablename__ = 'users'

    username = Column(String(30), unique=True, nullable=False)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    picture = Column(String(1000), nullable=True)

    # Many-to-many relationship for followers
    # followers: You access a list of users who follow a given user
    # following: You access a list of users that a given user is following
    followers = relationship(
        'User',
        secondary=user_follower,
        primaryjoin="User.id == user_follower.c.user_id",
        secondaryjoin="User.id == user_follower.c.follower_id",
        backref='following'
    )
    
    # Relationships to other tables
    # messages = relationship('Message', backref='user')
    # posts = relationship('Post', backref='user')
    # comments = relationship('Comment', backref='user')
    # likes = relationship('Like', backref='user')
    # notifications = relationship('Notification', backref='user')
    # chats = relationship('Chat', secondary='chat_user', backref='users')

    @property
    def password(self):
        return self.password_hash

    @password.setter
    def password(self, text_password):
        encoded_password = text_password.encode('utf-8')
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(encoded_password, salt)

    def check_password(self, password_to_check):
        return bcrypt.checkpw(password_to_check.encode('utf-8'), self.password_hash)
    
    def add_follower(self, follower_id):
        "adds a follower to a user and check self follow"
        from models import storage
        if self.id == follower_id:
            raise ValueError('A User can not follow himself')
        
        user = storage.get(User, self.id)
        if not user:
            raise ValueError('User not found')
        
        follower = storage.get(User, follower_id)
        if not follower:
            raise ValueError('Follower not found')
        
        user.followers.append(follower)
        storage.save()