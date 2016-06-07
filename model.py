"""Models and database functions for project."""


from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()


class Tag(db.Model):
    """Point of interest on website"""

    __tablename__ = "tags"

    tag_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    latitude = db.Column(db.Numeric(17,14), nullable=False)
    longitude = db.Column(db.Numeric(17,14), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    artist = db.Column(db.String(100), nullable=True)
    details = db.Column(db.String(1000), nullable=True)
    primary_image = db.Column(db.String(200),nullable=True)

    def __repr__(self):
        """Show information about the tag"""

        return "<Tag id= {} title= {}>".format(self.tag_id,
                                               self.title)


class Media(db.Model):
    """Media for tag"""

    __tablename__ = "medias"

    media_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.tag_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    media_url = db.Column(db.String(200), nullable=False)
    media_type = db.Column(db.String(30), nullable=False)

    tag = db.relationship("Tag",
                          backref=db.backref("medias", order_by=media_id))


    def __repr__(self):
        """Show information about the media"""

        return "<Media id= {}>".format(self.media_id)



class Genre(db.Model):
    """Category of tag"""

    __tablename__ = "genres"

    genre = db.Column(db.String(30), primary_key=True)



class TagGenre(db.Model):
    """Association for tag and genre"""    

    __tablename__ = "tags_genres"

    assc_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.tag_id'), nullable=False)
    genre = db.Column(db.String(30), db.ForeignKey('genres.genre'), nullable=False)

    tag = db.relationship("Tag",
                            backref=db.backref("genres", order_by=genre))



class User(db.Model):
    """User of website"""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(40), nullable=False)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(20), nullable=False)
    avatar = db.Column(db.String(300), nullable=True)

    def __repr__(self):
        """Show information about the user"""

        return "<User username= {}>".format(self.username)



class UserGenre(db.Model):
    """Association for user and genre"""    

    __tablename__ = "users_genres"

    assc_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    genre = db.Column(db.String(30), db.ForeignKey('genres.genre'), nullable=False)

    user = db.relationship("User",
                            backref=db.backref("genres", order_by=genre))



class Comment(db.Model):
    """Comment from user on specific tag"""

    __tablename__ = "comments"

    comment_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.tag_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.String(600), nullable=True)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    media = db.Column(db.String(300), nullable=True)

    user = db.relationship("User",
                            backref=db.backref("comments", order_by=logged_at))

    tag = db.relationship("Tag",
                            backref=db.backref("comments", order_by=tag_id))


    def __repr__(self):
        """Show information about the comment"""

        return "<Comment comment_id= {}>".format(self.comment_id)



###############################################################################

def example_data():
    """Sample data for testing."""
  # In case this is run more than once, empty out existing data
    User.query.delete()
    Tag.query.delete()
    Comment.query.delete()
    Media.query.delete()
    Genre.query.delete()
    TagGenre.query.delete()
    UserGenre.query.delete()
    Comment.query.delete()


    user = User(user_id=1,
                name='Drew',
                username='drewf',
                password='password',
                avatar='static/img/avatars/drewf.jpg')

    tag = Tag(tag_id=760,
                latitude=37.81690755123785,
                longitude=-122.28961365893830,
                title='15 Seconds',
                artist='Steve Gillman & Katherine Keefer',
                details='A mural',
                primary_image='/static/img/15sec.jpg')

    comment = Comment(comment_id=1,
                tag_id=760,
                user_id=1,
                content='test comment',
                logged_at=datetime(2016, 6, 6, 19, 1, 32, 669889),
                media=None)

    media = Media(media_id=1,
                tag_id=760,
                user_id=1,
                media_url='/static/img/15sec.jpg',
                media_type='image')

    genre = Genre(genre='art')

    tag_genre = TagGenre(assc_id=1,
                tag_id=760,
                genre='art')

    user_genre = UserGenre(assc_id=1,
                user_id=1,
                genre='art')

    comment = Comment(comment_id=1,
                tag_id=760,
                user_id=1,
                content='test comment',
                logged_at=datetime(2016, 6, 6, 19, 1, 32, 669889),
                media='/static/img/15sec.jpg')


    db.session.add_all([user, tag, comment, media, genre, tag_genre, user_genre, comment])
    db.session.commit()


###############################################################################


def connect_to_db(app, db_uri='postgresql:///tagline'):
    """Connect the database to Flask app."""

    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri #'postgresql:///tagline'
    db.app = app
    db.init_app(app)



if __name__ == "__main__":

    from server import app
    connect_to_db(app)
    print "Connected to DB."


