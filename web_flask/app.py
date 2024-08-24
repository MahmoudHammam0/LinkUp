#!/usr/bin/python3
"Flask app"
from flask import Flask, render_template, redirect, request, url_for, abort, jsonify, flash, session
from models import storage
from models.user import User
from models.chat import Chat
from flask_login import LoginManager, login_user, logout_user, current_user


app = Flask(__name__)
app.config['SECRET_KEY'] = '420d61563971313761f2e61f'
login_manager = LoginManager(app)


@app.route('/', strict_slashes=False, methods=["GET", "POST"])
def home():
    "Home page"
    if not current_user.is_authenticated:
        if request.method == "POST":
            user_data = request.get_json()
            if not user_data:
                abort(400, 'Not A Valid Json')

            required_data = ["email", "password"]
            for info in required_data:
                if info not in user_data.keys():
                    abort(400, f"Missing {info.capitalize()}")

            user = storage.check_credentials(
                user_data['email'], user_data['password'])
            if user:
                login_user(user)
                flash(f"{user.username} logged in successfully", 'success')
                return jsonify({"Success": True, "redirect_url": url_for('home')})
            else:
                abort(400, 'You have entered an invalid Email or Password')
        return render_template('home.html')
    
    return render_template('feed.html', user=current_user)

@app.route('/profile/<user_id>')
def profile(user_id):
    "user profile page"
    retrieved_user = storage.get(User, user_id)

    return render_template('profile.html', user=retrieved_user)


@app.route('/chat/<chat_id>')
def chat_page(chat_id):
    "Chat page"
    if current_user.is_authenticated:
        chat = storage.get(Chat, chat_id)
        if chat and current_user.id in [user.id for user in chat.users]:
            for user in chat.users:
                if user.id != current_user.id:
                    other_user = user
            room = f"chat_room_for_{chat_id}"
            session['room'] = room
            return render_template("chat.html", room=room,
                                                user=current_user,
                                                other_user=other_user)
        else:
            return redirect(url_for('home'))
    else:
        return render_template("home.html")


# @app.route('/messages')
# def messages():
#     "messages page"
#     sender_id = current_user.id
#     return redirect(url_for('chat', sender_id=sender_id))


@app.route('/logout')
def logout():
    "logout the current user"
    logout_user()
    return redirect(url_for('home'))


@login_manager.user_loader
def load_user(user_id):
    "load the current authenticated user"
    user = storage.get(User, user_id)
    if user:
        return user
    
@app.errorhandler(400)
def not_found(error):
    "Page Not Found"
    return jsonify({"Error": error.description}), 400



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)