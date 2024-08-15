#!/usr/bin/python3
"Users API views"
from models.user import User
from flask import jsonify, abort, request
from models import storage
from api.v1.views import app_views


@app_views.route("/users", methods=["GET"])
def get_all_users():
    "return all users"
    users = []
    for user in storage.all(User).values():
        users.append(user.to_dict())
    return jsonify(users)


@app_views.route("/users/<user_id>", methods=["GET"])
def get_user_by_id(user_id):
    "return user by specific id"
    user = storage.get(User, user_id)
    if user:
        return jsonify(user.to_dict())
    else:
        abort(404)


@app_views.route("/users", methods=["POST"])
def create_user():
    "validate data and create new user"
    user_data = request.get_json()
    if not user_data:
        abort(400, "Not A Vaild Json")
    
    data = ["username", "name", "email", "password"]
    for info in data:
        if info not in user_data:
            abort(400, f"Missing {info.capitalize()}")

    check_info = storage.email_username_check(
        user_data["email"], user_data["username"])
    if check_info:
        abort(400, check_info)

    new_user = User(**user_data)
    new_user.save()

    return jsonify(new_user.to_dict()), 201


@app_views.route("/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    "deletes a user"
    user = storage.get(User, user_id)
    if user:
        storage.delete(user)
        storage.save()
        return jsonify({}), 200
    else:
        abort(404)


@app_views.route("/users/<user_id>", methods=["PUT"])
def edit_user(user_id):
    "edit the user info"
    user = storage.get(User, user_id)
    if not user:
        abort(404)

    user_data = request.get_json()
    if not user_data:
        abort(400, "Not A Valid Json")

    for key, val in user_data.items():
        if key not in ['id', 'created_at', 'updated_at']:
            setattr(user, key, val)

    user.save()
    return jsonify(user.to_dict())


@app_views.route("/users/<user_id>/followers", methods=["GET"])
def get_followers_of_user(user_id):
    "return followers of a specific user"
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    
    followers = []
    for follower in user.followers:
        followers.append(follower.to_dict())
    
    return jsonify(followers)


@app_views.route("/users/<user_id>/following", methods=["GET"])
def get_following_of_user(user_id):
    "return users that the current user is following"
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    
    following = []
    for account in user.following:
        following.append(account.to_dict())
    
    return jsonify(following)