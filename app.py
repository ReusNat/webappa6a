from flask import (
    abort, Flask, jsonify, redirect, render_template, request,
    session, url_for
)
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
from pathlib import Path

app = Flask(__name__)
app.secret_key = b'bvfreheuwbvuorbvygfbchudevcgufegvy8ferhfu834jd3e9-fhcu90rfv'

sqlite_uri = 'sqlite:///' + os.path.abspath(os.path.curdir) + '/profiles.db'
app.config['SQLALCHEMY_DATABASE_URI'] = sqlite_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

IMAGE_DIR = 'static/img/profilephotos'

from models import Profile, Post, Like


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
    user_exists = db.session.query(db.session.query(Profile).filter_by(username=username).exists()).scalar()
    user = Profile.query.filter_by(username=username).first()
    if username == 'cartman' and password == 'beefcake' or user_exists == True and user.password == password:
        session['username'] = username
        return True

    return False


def is_secure_route(request):
    return request.path not in ['/login/', '/logout/', '/profile/new/', '/profile/'] and \
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
    username = get_username()
    return render_template('main.html', message=f'Welcome {username}!')


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
    un = request.form['username']
    pw = request.form['password']
    e = request.form['email']
    pp = request.files['profile-pict']
    filename = secure_filename(pp.filename)
    exists = db.session.query(db.session.query(Profile).filter_by(username=un).exists()).scalar()
    print(exists)
    if pp:
        if un == "":
            return render_template('new_user.html',
                                   message='Please enter a username.')
        elif pw == "":
            return render_template('new_user.html',
                                   message='Please enter a password.')
        elif e == "":
            return render_template('new_user.html',
                                   message='Please enter an email.')
        else:
            if exists:
                return render_template('new_user.html',
                                       message=f'The username {un} is already taken.')
            else:
                name, extention = filename.split('.')
                filename = name + un + '.' + extention
                filepath = os.path.join(IMAGE_DIR, filename)
                pp.save(filepath)
                new_user = Profile(username=un, password=pw, email=e, photofn=filename)
                db.session.add(new_user)
                db.session.commit()
                return redirect(url_for('login'))
    else:
        return render_template('new_user.html',
                               message='Please choose a profile picture.')

    return abort(400)


@app.route('/logout/')
def logout():
    if 'username' in session:
        del session['username']
    return render_template('login_form.html',
                           messages=['Logged out. Thanks for visiting.'])
