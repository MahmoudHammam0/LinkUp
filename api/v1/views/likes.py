#!/usr/bin/python3
"Likes API views"
from api.v1.views import app_views
from models import storage
from models.like import Like
from models.post import Post
from flask import jsonify, request, abort


@app_views.route('/likes', methods=["GET"])
def get_all_likes():
    "return all likes in storage"
    likes =[]
    for like in storage.all(Like).values():
        likes.append(like.to_dict())
    return jsonify(likes)


@app_views.route('/likes/<like_id>', methods=["GET"])
def get_specific_like(like_id):
    "return the like with specific id"
    like = storage.get(Like, like_id)
    if like:
        return jsonify(like.to_dict())
    else:
        abort(404)


@app_views.route('/likes', methods=["POST"])
def create_like():
    "create new like"
    like_data = request.get_json()
    if not like_data:
        abort(400, "Not A Valid Json")

    data = ['user_id', 'post_id']
    for info in data:
        if info not in like_data.keys():
            abort(400, f"Missing {info.capitalize()}")

    new_like = Like(**like_data)
    new_like.save()

    post = storage.get(Post, new_like.post_id)
    like_no = len(post.likes)
    like_dict = new_like.to_dict()
    like_dict['like_no'] = like_no

    return jsonify(like_dict), 201


@app_views.route('/likes/<like_id>', methods=["DELETE"])
def delete_like(like_id):
    "delete the like with specific id"
    like = storage.get(Like, like_id)
    if like:
        storage.delete(like)
        storage.save()
        return jsonify({}), 200
    else:
        abort(404)


@app_views.route('/likes/<like_id>', methods=["PUT"])
def update_like(like_id):
    "update the like"
    like = storage.get(Like, like_id)
    if not like:
        abort(404)

    like_data = request.get_json()
    if not like_data:
        abort(400, "Not A Valid Json")

    for key, val in like_data.items():
        if key not in ['id', 'created_at', 'updated_at']:
            setattr(like, key, val)

    like.save()
    return jsonify(like.to_dict())