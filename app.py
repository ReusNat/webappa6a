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
from models import Profile, Post, Like

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
    user_exists = db.session.query(
            db.session.query(Profile).filter_by(
                username=username).exists()).scalar()
    user = Profile.query.filter_by(username=username).first()
    if user_exists and user.password == password:
        session['username'] = username
        return True

    return False


def is_secure_route(request):
    if request.path == '/profile/' and request.method == 'GET':
        return True
    elif request.path == '/logout/':
        return True
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


@app.route('/profile/', methods=['GET'])
def get_profile():
    username = session['username']
    user = Profile.query.filter_by(username=username).first()
    return render_template('profile.html',
                           user=user, 
                           profile_id=user.id)


@app.route('/profile/<int:profile_id>/', methods=['GET'])
def get_profile_by_id(profile_id):
    username = session['username']
    currUser = Profile.query.filter_by(username=username).first()
    user = Profile.query.get(profile_id)
    if user is None:
        return render_template('main.html',
                               message='That user does not exist')

    return render_template('profile.html',
                           user=user,
                           profile_id=currUser.id)


@app.route('/profile/new/', methods=['GET'])
def new_user_form():
    return render_template('new_user.html')


@app.route('/api/posts/', methods=['GET'])
def get_posts():
    username = session['username']
    user = Profile.query.filter_by(username=username).first()
    the_id = user.id

    if 'profile_id' in request.args:
        the_id = request.args['profile_id']

    posts = list(map(lambda p: p.serialize(), Post.query.filter_by(profile_id=the_id)))
    return jsonify(posts)


@app.route('/api/posts/<int:post_id>/like/', methods=['POST'])
def like_post(post_id):
    post = Post.query.get(post_id)
    username = session['username']
    user = Profile.query.filter_by(username=username).first()

    like = Like(profile_id=user.id, post_id=post_id)

    db.session.add(like)
    db.session.commit()
    return jsonify(post.serialize())


@app.route('/api/posts/<int:post_id>/unlike/', methods=['POST'])
def unlike_post(post_id):
    post = Post.query.get(post_id)
    username = session['username']
    user = Profile.query.filter_by(username=username).first()

    like = Like.query.filter_by(post_id=post_id, profile_id=user.id).first()

    db.session.delete(like)
    db.session.commit()
    return jsonify(post.serialize())


@app.route('/api/posts/', methods=['POST'])
def create_post():
    content = request.form['content']
    username = session['username']
    user = Profile.query.filter_by(username=username).first()
    post = Post(content=content, profile_id=user.id, likes=[])
    db.session.add(post)
    db.session.commit()
    return jsonify(post.serialize())


@app.route('/profile/', methods=['POST'])
def new_user():
    un = request.form['username']
    pw = request.form['password']
    e = request.form['email']
    pp = request.files['profile-pict']
    filename = secure_filename(pp.filename)
    exists = db.session.query(
            db.session.query(Profile).filter_by(username=un).exists()).scalar()
    if pp:
        if un == '':
            return render_template('new_user.html',
                                   message='Please enter a username.')
        elif pw == '':
            return render_template('new_user.html',
                                   message='Please enter a password.')
        elif e == '':
            return render_template('new_user.html',
                                   message='Please enter an email.')
        else:
            if exists:
                return render_template('new_user.html',
                                       message=f'The username {un}\
                                               is already taken.')
            else:
                name, extention = filename.split('.')
                filename = name + un + '.' + extention
                filepath = os.path.join(IMAGE_DIR, filename)
                pp.save(filepath)
                new_user = Profile(username=un, password=pw,
                                   email=e, photofn=filename)
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
