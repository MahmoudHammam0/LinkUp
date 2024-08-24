#!/usr/bin/python3
"API app"
from flask import Flask, jsonify, session, request
from flask_cors import CORS
from api.v1.views import app_views
from models import storage
from flask_socketio import SocketIO, send, join_room, leave_room, disconnect


app = Flask(__name__)
cors = CORS(app, resources={r"/api/v1/*": {"origins": "*"}})
app.register_blueprint(app_views)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.teardown_appcontext
def tear_down(e):
    "close storage connection after each request"
    storage.close()


@app.errorhandler(404)
def not_found(error):
    return jsonify({"Error": "Not Found"}), 404


@app.errorhandler(400)
def not_found(error):
    return jsonify({"Error": error.description}), 400


@socketio.on('join')
def join_chat(data):
    "add a user to the chat room"
    from models.chat import Chat
    room = data['room']
    user_id = data['current_user_id']
    chat_id = room.split('_')[-1]
    chat = storage.get(Chat, chat_id)
    users_ids = [user.id for user in chat.users]
    if chat and user_id in users_ids:
        join_room(room)
    else:
        send("Access denied.", to=request.sid)
        disconnect()


@socketio.on('message')
def handle_message(data):
    send(data['message'], room=data['room'])


# @socketio.on('leave')
# def leave_chat(data):
#     room = data['room']
#     leave_room(room)
#     send(f"User has left the room {room}.", room=room)


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5001, debug=True)