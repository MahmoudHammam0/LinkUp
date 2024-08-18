#!/usr/bin/python3
"Posts API views"
from models.post import Post
from models.user import User
from flask import jsonify, abort, request
from models import storage
from api.v1.views import app_views
from werkzeug.utils import secure_filename
import os
from datetime import datetime


UPLOAD_FOLDER = os.path.join(os.getcwd(), 'web_flask', 'static', 'uploads')


@app_views.route("/posts", methods=["GET"])
def get_all_posts():
    "return all posts"
    posts = []
    for post in storage.all(Post).values():
        posts.append(post.to_dict())
    return jsonify(posts)


@app_views.route("posts/<post_id>", methods=["GET"])
def get_posts_by_id(post_id):
    "return post with a specific id"
    post = storage.get(Post, post_id)
    if post:
        return jsonify(post.to_dict())
    else:
        abort(404)


@app_views.route("/users/<user_id>/posts", methods=["GET"])
def get_posts_of_user(user_id):
    "return posts of a specific user"
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    
    posts = []
    for post in user.posts:
        likes_no = len(post.likes)
        post_dict = post.to_dict()
        post_dict['likes_no'] = likes_no

        # Convert 'likes' to a list of serializable data (IDs)
        post_dict['likes'] = [like.id for like in post.likes]

        posts.append(post_dict)
        
    posts.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify(posts)


@app_views.route("users/<user_id>/posts", methods=["POST"])
def create_post(user_id):
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    
    content = request.form.get('content')

    if not content:
        abort(400, "Missing Content")

    photo_url = None
    if 'photo' in request.files:
        photo = request.files.get('photo')
        if photo and photo.filename:
            file_name = secure_filename(photo.filename)
            photo_path = os.path.join(UPLOAD_FOLDER, file_name)
            photo.save(photo_path)
            photo_url = f'../static/uploads/{file_name}'

    post_data = {
        'content': content,
        'user_id': user_id,
    }
    
    if photo_url:
        post_data['picture'] = photo_url

    new_post = Post(**post_data)
    new_post.save()

    return jsonify(new_post.to_dict()), 201


@app_views.route("/posts/<post_id>", methods=["DELETE"])
def delete_post(post_id):
    "deletes a post"
    post = storage.get(Post, post_id)
    if post:
        storage.delete(post)
        storage.save()
        return jsonify({}), 200
    else:
        abort(404)


@app_views.route("/posts/<post_id>", methods=["PUT"])
def update_post(post_id):
    "update a post"
    post = storage.get(Post, post_id)
    if not post:
        abort(404)

    post_data = request.get_json()
    if not post_data:
        abort(400, "Not A Valid Json")

    for key, val in post_data.items():
        if key not in ['id', 'created_at', 'updated_at']:
            setattr(post, key, val)

    post.save()
    return jsonify(post.to_dict())