#!/usr/bin/python3
from models.user import User
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

for follower in new_user.followers:
    print(follower)

print("DONE!")