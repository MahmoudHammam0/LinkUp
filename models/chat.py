# #!/usr/bin/python3
# """ Chat module """
# from sqlalchemy import Column, Integer, String, Table, ForeignKey
# from sqlalchemy.orm import relationship
# from models.base_model import BaseModel, Base


# class Chat(BaseModel, Base):
#     """ Chat class """
#     __tablename__ = 'chats'

#     # One-to-many relationship with messages
#     messages = relationship('Message', backref='chat')