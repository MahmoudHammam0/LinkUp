#!/usr/bin/python3
""" User module """
from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from flask_login import UserMixin
from models.base_model import BaseModel, Base

# many-to-many relationship table for followers
user_follower = Table(
    'user_follower',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True, nullable=False),
    Column('follower_id', Integer, ForeignKey('users.id'), primary_key=True, nullable=False)
)

class User(BaseModel, Base, UserMixin):
    """ User class """
    __tablename__ = 'users'

    username = Column(String(30), unique=True, nullable=False)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    picture = Column(String(1000), nullable=False)

    # Many-to-many relationship for followers
    # followers: You access a list of users who follow a given user
    # following: You access a list of users that a given user is following
    followers = relationship(
        'User',
        secondary=user_follower,
        primaryjoin=user_follower.c.user_id == id,
        secondaryjoin=user_follower.c.follower_id == id,
        backref='following'
    )
    
    # Relationships to other tables
    messages = relationship('Message', backref='user')
    posts = relationship('Post', backref='user')
    comments = relationship('Comment', backref='user')
    likes = relationship('Like', backref='user')
    notifications = relationship('Notification', backref='user')
    chats = relationship('Chat', secondary='chat_user', backref='users')

    @property
    def password(self):
        return self.password_hash

    @password.setter
    def password(self, text_password):
        from web_flask.flask_app import bcrypt
        self.password_hash = bcrypt.generate_password_hash(text_password).decode('utf-8')

    def check_password(self, password_to_check):
        from web_flask.flask_app import bcrypt
        return bcrypt.check_password_hash(self.password_hash, password_to_check)