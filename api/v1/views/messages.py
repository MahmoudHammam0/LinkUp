#!/usr/bin/python3
"Messages API views"
from api.v1.views import app_views
from flask import jsonify, abort, request
from models import storage
from models.message import Message


@app_views.route('/messages', methods=["GET"])
def get_all_messages():
    "returns all messages in storage"
    messages = []
    for message in storage.all(Message).values():
        messages.append(message.to_dict())
    return jsonify(messages)


@app_views.route('/messages/<message_id>', methods=["GET"])
def get_specific_message(message_id):
    "returns the message with the specific id"
    message = storage.get(Message, message_id)
    if message:
        return jsonify(message.to_dict())
    else:
        abort(404)


@app_views.route('/messages', methods=["POST"])
def create_message():
    "create a new message and save it to storage"
    message_data = request.get_json()
    if not message_data:
        abort(400, "Not A Valid Json")

    data = ['content', 'sender_id', 'chat_id']
    for info in data:
        if info not in message_data.keys():
            abort(400, f"Missing {info.capitalize()}")

    new_message = Message(**message_data)
    new_message.save()

    return jsonify(new_message.to_dict())


@app_views.route('/messages/<message_id>', methods=["DELETE"])
def delete_message(message_id):
    "delete the message with the specific id"
    message = storage.get(Message, message_id)
    if message:
        storage.delete(message)
        storage.save()
        return jsonify({})
    else:
        abort(404)


@app_views.route('/messages/<message_id>', methods=["PUT"])
def update_message(message_id):
    "edit the message with specific id"
    message = storage.get(Message, message_id)
    if not message:
        abort(404)

    message_data = request.get_json()
    if not message_data:
        abort(400, "Not A Valid Json")

    for key, val in message_data.items():
        if key not in ['id', 'created_at', 'updated_at']:
            setattr(message, key, val)

    message.save()
    return jsonify(message.to_dict())


@app_views.route('/messages/<message_id>/read', methods=["PUT"])
def mark_message_as_read(message_id):
    "Mark a message as read for the current user"
    message = storage.get(Message, message_id)
    if message:
        message.read = True
        message.save()
        return jsonify(message.to_dict()), 200
    else:
        abort(404)