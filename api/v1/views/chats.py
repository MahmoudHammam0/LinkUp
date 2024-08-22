#!/usr/bin/python3
"Chats API views"
from api.v1.views import app_views
from flask import jsonify, abort, request
from models import storage
from models.chat import Chat


@app_views.route('/chats', methods=["GET"])
def get_all_chats():
    "return all chats in storage"
    chats = []
    for chat in storage.all(Chat).values():
        chats.append(chat.to_dict())
    return jsonify(chats)


@app_views.route('/chats/<chat_id>', methods=["GET"])
def get_specific_chat(chat_id):
    "return the chat with specific id"
    chat = storage.get(Chat, chat_id)
    if chat:
        return jsonify(chat.to_dict())
    else:
        abort(404)


@app_views.route('/chats', methods=["POST"])
def create_chat():
    "create a new chat and save to storage"
    chat_data = request.get_json()
    if not chat_data:
        abort(400, "Not A Valid Json")

    user_ids = chat_data.get('user_ids')
    if not user_ids:
        abort(400, "Missing User_ids")

    new_chat = Chat()
    new_chat.add_users(user_ids)
    new_chat.save()

    return jsonify(new_chat.to_dict()), 201


@app_views.route('/chats/<chat_id>', methods=["DELETE"])
def delete_chat(chat_id):
    "delete the chat with specific ids"
    chat = storage.get(Chat, chat_id)
    if chat:
        storage.delete(chat)
        storage.save()
        return jsonify({})
    else:
        abort(404)


@app_views.route('/chats/<chat_id>', methods=["PUT"])
def update_chat(chat_id):
    "edit the chat with specific id"
    chat = storage.get(Chat, chat_id)
    if not chat:
        abort(404)
    
    chat_data = request.get_json()
    if not chat_data:
        abort(400, "Not A Valid Json")

    for key, val in chat_data.items():
        if key not in ['id', 'created_at', 'updated_at']:
            setattr(chat, key, val)

    chat.save()
    return jsonify(chat.to_dict())