#!/usr/bin/python3
"Comments API views"
from models.comment import Comment
from models.post import Post
from models.user import User
from flask import jsonify, abort, request
from models import storage
from api.v1.views import app_views


@app_views.route('/comments', methods=["GET"])
def get_comments():
    "returns all comments from the storage"
    comments = []
    for comment in storage.all(Comment).values():
        comments.append(comment.to_dict())
    return jsonify(comments)


@app_views.route('/comments/<comment_id>', methods=["GET"])
def get_specific_comment(comment_id):
    "returns the specific comment by id"
    comment = storage.get(Comment, comment_id)
    if comment:
        return jsonify(comment.to_dict())
    else:
        abort(404)


@app_views.route('/comments', methods=["POST"])
def create_comment():
    "create a new comment for a post"
    comment_data = request.get_json()
    if not comment_data:
        abort(400, "Not A Valid Json")

    data = ['content', 'user_id', 'post_id']
    for info in data:
        if info not in comment_data.keys():
            abort(400, f"Missing {info.capitalize()}")

    new_comment = Comment(**comment_data)
    new_comment.save()

    return jsonify(new_comment.to_dict()), 201


@app_views.route('/comments/<comment_id>', methods=["DELETE"])
def delete_comment(comment_id):
    "delete a comment with the specific id"
    comment = storage.get(Comment, comment_id)
    if comment:
        storage.delete(comment)
        storage.save()
        return jsonify({})
    else:
        abort(404)


@app_views.route('/comments/<comment_id>', methods=["PUT"])
def edit_comment(comment_id):
    "update the content of a comment"
    comment = storage.get(Comment, comment_id)
    if not comment:
        abort(404)

    comment_data = request.get_json()
    if not comment_data:
        abort(400, "Not A Valid Json")

    for key, val in comment_data.items():
        if key not in ['id', 'created_at', 'updated_at']:
            setattr(comment, key, val)

    comment.save()
    return jsonify(comment.to_dict())


@app_views.route('/posts/<post_id>/comments', methods=["GET"])
def get_comments_for_post(post_id):
    "return a list of comments for a specific post"
    post = storage.get(Post, post_id)
    comments = []
    if post:
        for comment in post.comments:
            user = storage.get(User, comment.user_id)
            comment_dict = comment.to_dict()
            comment_dict['User'] = user.to_dict()
            comments.append(comment_dict)

        comments.sort(key=lambda x: x['created_at'], reverse=True)
        return jsonify(comments)
    else:
        abort(404)