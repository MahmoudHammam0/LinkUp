#!/usr/bin/python3
""" DBStorage class module """
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from models.base_model import BaseModel, Base
from models.user import User
from models.chat import Chat
from models.message import Message
from models.post import Post
from models.comment import Comment
from models.like import Like
from models.notification import Notification


class DBStorage:
    """ The storage engine for SQLAlchemy """
    __engine = None
    __session = None
    classes = {
            'BaseModel': BaseModel,
            'User': User,
            'Chat': Chat,
            'Message': Message,
            'Post': Post,
            'Comment': Comment,
            'Like': Like,
            'Notification': Notification
            }

    def __init__(self):
        """ Creates the MySQL engine
            Drops all the tables in a test environment (if HBNB_ENV == test)
        """
        """
        user = "artisans_alley_user"
        passwd = "artisans_alley_pwd"
        host = "localhost"
        db = "artisans_alley_db"
        """
        user = "linkup_user"
        passwd = "linkup_pwd"
        host = "localhost"
        db = "linkup_db"

        self.__engine = create_engine('mysql+mysqldb://{}:{}@{}/{}'
                                      .format(user, passwd, host, db),
                                      pool_pre_ping=True)

    def all(self, cls=None):
        """ Query on the current database session all objects
            depending on the class name
        """
        objects_dict = {}

        if cls is None:
            classes_to_query = [User, Chat, Message, Post, Comment, Like, Notification]
        else:
            classes_to_query = [cls]

        for class_name in classes_to_query:
            objects = self.__session.query(class_name).all()
            for obj in objects:
                key = "{}.{}".format(obj.__class__.__name__, obj.id)
                objects_dict[key] = obj

        return objects_dict

    def new(self, obj):
        """ Add the object to the current database session """
        self.__session.add(obj)

    def save(self):
        """ Commit all changes of the current database session """
        self.__session.commit()

    def delete(self, obj=None):
        """ Delete from the current database session obj if not None """
        if obj:
            self.__session.delete(obj)

    def reload(self):
        """ Creates all tables in the database
            and creates the current database session """
        Base.metadata.create_all(self.__engine)
        Session = sessionmaker(bind=self.__engine, expire_on_commit=False)
        self.__session = scoped_session(Session)

    def close(self):
        'tell our registry to dispose of session'
        self.__session.close()

    def get(self, cls, id):
        """ retrieve one object of a class 'cls' based on its id """
        if cls in self.classes.values():
            objects_dict = self.all(cls)
            for obj in objects_dict.values():
                if obj.id == id:
                    return obj
        return None

    def count(self, cls=None):
        """ counts the number of objects of the 'cls' class
            or the number of all objects if no class is specified
        """
        if cls:
            if cls in self.classes.values():
                return self.__session.query(cls).count()
            else:
                return 0
        else:
            return len(self.all())

    def email_username_check(self, email_to_check, username_to_check):
        "check the email and username before the user creation"
        info_valid = {}
        user = self.__session.query(User).filter_by(email=email_to_check).first()
        if user:
            info_valid["email"] = "Email already exists"
        user = self.__session.query(User).filter_by(username=username_to_check).first()
        if user:
            info_valid["username"] = "User name already exists"
        return info_valid