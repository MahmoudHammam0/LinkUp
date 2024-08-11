#!/usr/bin/python3
from models.user import User
from models.chat import Chat
from models.message import Message
from models.post import Post
from models.comment import Comment
from models.like import Like
from models.notification import Notification
from models import storage


new_user = User(
    username="MahmoudSS",
    name="Mahmoud",
    email="m@m.com",
    password="123"
    )
new_user.save()

new_user2 = User(
    username="MahmoudSSs",
    name="Mahmoud2",
    email="m@m2.com",
    password="1235"
    )
new_user2.save()

new_user3 = User(
    username="YoussefG",
    name="Youssef",
    email="y@y.com",
    password="12345"
    )
new_user3.save()

new_user4 = User(
    username="YoussefG2",
    name="YoussefG",
    email="y@y2.com",
    password="123445"
    )
new_user4.save()

new_user.add_follower(new_user2.id)
new_user.add_follower(new_user3.id)
new_user.add_follower(new_user4.id)

print("Followers: ")
for follower in new_user.followers:
    print(follower)

new_chat = Chat()
new_chat.save()

new_chat.add_users([new_user.id, new_user3.id])

print("Chat members: ")
for user in new_chat.users:
    print(user)

print("Chats for new_user:")
print(new_user.chats)

new_message = Message(
    content="Hello, how u doing?",
    user_id=new_user.id,
    chat_id=new_chat.id
    )
new_message.save()

new_message2 = Message(
    content="I'm fine, and u?",
    user_id=new_user3.id,
    chat_id=new_chat.id
    )
new_message2.save()

print("Chat messages: ")
for msg in new_chat.messages:
    print(msg)


# Create and save a post
new_post = Post(
    title="My First Post",
    content="This is the content of my first post.",
    user_id=new_user.id
)
new_post.save()

print("Posts for new_user:")
print(new_user.posts)

# Create and save comments
new_comment = Comment(
    content="Great post!",
    user_id=new_user3.id,
    post_id=new_post.id
)
new_comment.save()

new_comment2 = Comment(
    content="I agree!",
    user_id=new_user4.id,
    post_id=new_post.id
)
new_comment2.save()

print("Comments on the post:")
for comment in new_post.comments:
    print(comment)

# Create and save likes
new_like = Like(
    user_id=new_user.id,
    post_id=new_post.id
)
new_like.save()

new_like2 = Like(
    user_id=new_user3.id,
    post_id=new_post.id
)
new_like2.save()

print("Likes on the post:")
for like in new_post.likes:
    print(like)

# Test Notification
new_notification = Notification(
    content="You have a new message!",
    type="Message",
    read=False,
    user_id=new_user.id
)
new_notification.save()

print("Notifications for new_user:")
for notification in new_user.notifications:
    print(notification)

print("DONE!")