"""Models and database functions for flaneur project."""


from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()


class Landmark(db.Model):
    """Point of interest on urbex website"""

    __tablename__ = "landmarks"

    landmark_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    latitude = db.Column(db.Decimal, nullable=False)
    longitude = db.Column(db.Decimal, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    artist = db.Column(db.String(70), nullable=True)
    details = db.Column(db.String(300), nullable=True)
    # image_url = db.Column(db.String(200), nullable=True)


    def __repr__(self):
        """Show information about the landmark"""

        return "<Landmark id= {} title= {}>".format(
                                                    self.landmark_id,
                                                    self.title)


# class User(db.Model):
#     """User of urbex website"""

#     __tablename__ = "users"

#     user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
#     username = db.Column(db.Decimal, nullable=False)
#     password = db.Column(db.Decimal, nullable=False)
#     email = db.Column(db.String(64), nullable=True)


#     def __repr__(self):
#         """Show information about the user"""

#         return "<User username= {}>".format(self.username)


# class Comment(db.Model):
#     """Comment from user on specific landmark"""

#     __tablename__ = "comment"

#     comment_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
#     landmark_id = db.Column(db.Integer, db.ForeignKey('landmarks.landmark_id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
#     comment = db.Column(db.String(600), nullable=False)
#     logged_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

#     user = db.relationship("User",
#                             backref=db.backref("comments", order_by=logged_at))

#     landmark = db.relationship("Landmark",
#                             backref=db.backref("comments", order_by=landmark_id))


#     def __repr__(self):
#         """Show information about the comment"""

#         return "<Comment comment_id= {}>".format(self.comment_id)



