#!/usr/bin/python3
"Notifications API views"
from api.v1.views import app_views
from models import storage
from models.notification import Notification
from flask import jsonify, abort, request


@app_views.route('/notifys', methods=["GET"])
def get_all_notifications():
    "return all notifications in storage"
    notifys = []
    for notify in storage.all(Notification).values():
        notifys.append(notify.to_dict())
    return jsonify(notifys)


@app_views.route('/notifys/<notify_id>', methods=["GET"])
def get_specific_notify(notify_id):
    "return the notification with specific id"
    notify = storage.get(Notification, notify_id)
    if notify:
        return jsonify(notify.to_dict())
    else:
        abort(404)


@app_views.route('/notifys/<notify_id>', methods=["DELETE"])
def delete_specific_notify(notify_id):
    "delete the notification with specific id"
    notify = storage.get(Notification, notify_id)
    if notify:
        storage.delete(notify)
        storage.save()
        return jsonify({})
    else:
        abort(404)


@app_views.route('/notifys', methods=["POST"])
def create_notification():
    "create a new notification and save it in the db"
    notify_data = request.get_json()
    if not notify_data:
        abort(400, "Not A Valid Json")

    data = ['content', 'type', 'user_id']
    for info in data:
        if not info in notify_data.keys():
            abort(400, f"Missing {info.capitalize()}")

    new_notify = Notification(**notify_data)
    new_notify.save()
    print("new notify is created", new_notify)
    return jsonify(new_notify.to_dict()), 201


@app_views.route('/notifys/<notify_id>', methods=["PUT"])
def update_notification(notify_id):
    "update the data of a notification"
    notify = storage.get(Notification, notify_id)
    if not notify:
        abort(404)
    
    notify_data = request.get_json()
    if not notify_data:
        abort(400, "Not A Valid Json")

    for key, val in notify_data.items():
        if key not in ['id', 'created_at', 'updated_at']:
            setattr(notify, key, val)

    notify.save()
    return jsonify(notify.to_dict())