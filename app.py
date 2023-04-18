from flask import (
    abort, Flask, jsonify, redirect, render_template, request,
    session, url_for
)
from flask_sqlalchemy import SQLAlchemy
from pathlib import Path
from models import Profile, Post, Like
import os

app = Flask(__name__)
app.secret_key = b'bvfreheuwbvuorbvygfbchudevcgufegvy8ferhfu834jd3e9-fhcu90rfv'

sqlite_uri = 'sqlite:///' + os.path.abspath(os.path.curdir) + '/profiles.db'
app.config['SQLALCHEMY_DATABASE_URI'] = sqlite_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


IMAGE_DIR = 'static/img/profilephotos'


@app.before_first_request
def app_init():
    imgdir = Path(IMAGE_DIR)
    if not imgdir.exists():
        imgdir.mkdir(parents=True)

        try:
            Profile.query.all()
        except Exception:
            db.create_all()


def get_username():
    if 'username' in session:
        return session['username']

    return None


def authenticate(username, password):
    if username == 'cartman' and password == 'beefcake':
        session['username'] = username
        return True

    return False


def is_secure_route(request):
    return request.path not in ['/login/', '/logout/'] and \
        not request.path.startswith('/static/')


@app.before_request
def login_redirect():
    if get_username() is None and is_secure_route(request):
        return redirect(url_for('login_form'))


@app.route('/')
def index():
    return redirect(url_for('main'))


@app.route('/main/')
def main():
    return render_template('main.html', username=get_username())


@app.route('/login/', methods=['GET'])
def login_form():
    return render_template('login_form.html')


@app.route('/login/', methods=['POST'])
def login():
    if authenticate(request.form['username'], request.form['password']):
        return redirect(url_for('main'))
    else:
        return render_template('login_form.html',
                               messages=['Invalid username/password'])


@app.route('/profile/new/', methods=['GET'])
def new_user_form():
    return render_template('new_user.html')


@app.route('/profile/', methods=['POST'])
def new_user():
    username = request.form['username']
    password = request.form['password']
    email = request.form['email']
    pp = request.form['profile-pict']


@app.route('/logout/')
def logout():
    if 'username' in session:
        del session['username']
    return render_template('login_form.html',
                           messages=['Logged out. Thanks for visiting.'])
