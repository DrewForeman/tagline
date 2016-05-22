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
    content = db.Column(db.String(600), nullable=False)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship("User",
                            backref=db.backref("comments", order_by=logged_at))

    tag = db.relationship("Tag",
                            backref=db.backref("comments", order_by=tag_id))


    def __repr__(self):
        """Show information about the comment"""

        return "<Comment comment_id= {}>".format(self.comment_id)




def connect_to_db(app):
    """Connect the database to Flask app."""

    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///tags'
    db.app = app
    db.init_app(app)


if __name__ == "__main__":

    from server import app
    connect_to_db(app)
    print "Connected to DB."


