#!/usr/bin/python3
"Posts API views"
from models.post import Post
from models.user import User
from flask import jsonify, abort, request
from models import storage
from api.v1.views import app_views


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
        posts.append(post_dict)
    
    return jsonify(posts)


@app_views.route("users/<user_id>/posts", methods=["POST"])
def create_post(user_id):
    "creates a new post for a user"
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    
    post_data = request.get_json()
    if not post_data:
        abort(400, "Not A Vaild Json")
    
    data = ["title", "content"]
    for info in data:
        if info not in post_data:
            abort(400, f"Missing {info.capitalize()}")
    
    post_data['user_id'] = user_id
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