#!/usr/bin/python3
"Chats API views"
from api.v1.views import app_views
from flask import jsonify, abort, request
from models import storage
from models.chat import Chat
from models.user import User


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


@app_views.route('/chats/<user_id>/chats', methods=["GET"])
def get_chats_for_user(user_id):
    "return all chats that a user is part of"
    user = storage.get(User, user_id)
    if user:
        chats = []
        for chat in user.chats:
            chat_dict = chat.to_dict()
            for user in chat.users:
                if user_id != user.id:
                    other_user = user
            chat_dict['user_id'] = other_user.id
            chat_dict['user_name'] = other_user.name
            chat_dict['user_photo'] = other_user.profile_photo

            # Get the latest message
            latest_message = None
            for message in chat.messages:
                if latest_message is None or message.created_at > latest_message.created_at:
                    latest_message = message

            # Add the latest message to the chat dictionary
            if latest_message:
                chat_dict['latest_message'] = latest_message.to_dict()
            else:
                chat_dict['latest_message'] = None

            chats.append(chat_dict)
        return jsonify(chats)
    else:
        abort(404)



@app_views.route('/chats/<chat_id>/messages', methods=["GET"])
def get_messages_for_chat(chat_id):
    "return all messsages for a specific chat"
    chat = storage.get(Chat, chat_id)
    if chat:
        messages = []
        for msg in chat.messages:
            user = storage.get(User, msg.sender_id)
            message_dict = msg.to_dict()
            message_dict['sender_img'] = user.profile_photo
            messages.append(message_dict)
        messages.sort(key=lambda x: x['created_at'])
        return jsonify(messages)
    else:
        abort(404)


@app_views.route('/chats', methods=["POST"])
def create_chat():
    "create a new chat and save to storage or return chat if it already exists"
    chat_data = request.get_json()
    if not chat_data:
        abort(400, "Not A Valid Json")

    data = ['auth_user_id', 'user_id']
    for info in data:
        if not info in chat_data.keys():
            abort(400, f"Missing {info.capitalize()}")

    auth_user_id = chat_data.get('auth_user_id')
    user_id = chat_data.get('user_id')
    if auth_user_id and user_id:
        chat = storage.find_existing_chat(auth_user_id, user_id)
    
    if chat:
        return jsonify(chat.to_dict())
    
    else:
        new_chat = Chat()
        new_chat.add_users([auth_user_id, user_id])
        new_chat.save()
        new_chat_dict = new_chat.to_dict()
        new_chat_dict['users'] = [user.id for user in new_chat_dict['users']]
        return jsonify(new_chat_dict), 201


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