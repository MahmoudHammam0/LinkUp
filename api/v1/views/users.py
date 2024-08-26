#!/usr/bin/python3
"Users API views"
from models.user import User
from flask import jsonify, abort, request
from models import storage
from api.v1.views import app_views
from werkzeug.utils import secure_filename
import os


UPLOAD_FOLDER = os.path.join(os.getcwd(), 'web_flask', 'static', 'uploads')


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
        user_dict = user.to_dict()
        user_dict['liked_posts'] = [like.post_id for like in user.likes]
        return jsonify(user_dict)
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
    "Edit the user info"
    user = storage.get(User, user_id)
    if not user:
        abort(404, description="User not found")

    if 'cover' in request.files:
        cover = request.files['cover']
        if cover:
            file_name = secure_filename(cover.filename)
            cover_path = os.path.join(UPLOAD_FOLDER, file_name)
            cover.save(cover_path)
            setattr(user, 'cover_photo', f'../static/uploads/{file_name}')
            user.save()
            return jsonify(user.to_dict())
        else:
            abort(400, description="Invalid cover file")

    if 'photo' in request.files:
        photo = request.files['photo']
        if photo:
            file_name = secure_filename(photo.filename)
            photo_path = os.path.join(UPLOAD_FOLDER, file_name)
            photo.save(photo_path)
            setattr(user, 'profile_photo', f'../static/uploads/{file_name}')
            user.save()
            return jsonify(user.to_dict())
        else:
            abort(400, description="Invalid photo file")

    user_data = request.get_json()
    if user_data:
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
        follower_dict = follower.to_dict()
        follower_dict['followers'] = [follower.id for follower in follower.followers]
        followers.append(follower_dict)
    
    return jsonify(followers)


@app_views.route("/users/<user_id>/following", methods=["GET"])
def get_following_of_user(user_id):
    "return users that the current user is following"
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    
    following = []
    for account in user.following:
        account_dict = account.to_dict()
        account_dict['following'] = [account.id for account in account.following]
        following.append(account_dict)
    
    return jsonify(following)


@app_views.route("/users/<user_id>/follow/<user_to_follow_id>", methods=["POST"])
def follow_user(user_id, user_to_follow_id):
    "adds a user to the list of users the signed-in user is following"
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    
    user_to_follow = storage.get(User, user_to_follow_id)
    if not user_to_follow:
        abort(404)
    
    if user_to_follow in user.following:
        return jsonify({"error": "User already followed"}), 400
    
    user.following.append(user_to_follow)
    user.save()

    return jsonify({"message": "User followed successfully"}), 201


@app_views.route("/users/<user_id>/unfollow/<user_to_unfollow_id>", methods=["POST"])
def unfollow_user(user_id, user_to_unfollow_id):
    "removes a user from the list of users the signed-in user is following"
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    
    user_to_unfollow = storage.get(User, user_to_unfollow_id)
    if not user_to_unfollow:
        abort(404)
    
    if user_to_unfollow not in user.following:
        return jsonify({"error": "User not being followed"}), 400
    
    user.following.remove(user_to_unfollow)
    user.save()

    return jsonify({"message": "User unfollowed successfully"}), 201


@app_views.route("/users/<user_id>/mutualswith/<user_to_follow_id>", methods=["GET"])
def get_mutual_friends(user_id, user_to_follow_id):
    "return number of mutual friends between two users"
    user = storage.get(User, user_id)
    if not user:
        abort(404)
        
    user_to_follow = storage.get(User, user_to_follow_id)
    if not user_to_follow:
        abort(404)
    
    count = 0
    for usr in user.following:
        for u in user_to_follow.following:
            if user == u:
                count += 1

    return jsonify({"count": count})