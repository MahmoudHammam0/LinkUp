#!/usr/bin/python3
"Flask app"
from flask import Flask, render_template


app = Flask(__name__)


@app.route('/', strict_slashes=False)
def home():
    "Home page"
    return render_template('home.html')

@app.route('/profile', strict_slashes=False)
def profile():
    "user profile page"
    return render_template('profile.html')

@app.route('/feed', strict_slashes=False)
def feed():
    "feed page"
    return render_template('feed.html')


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)