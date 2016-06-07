from unittest import TestCase
from model import Tag, User, Genre, TagGenre, UserGenre, Comment, Media, connect_to_db, db, example_data
from server import app
import server
from route import find_bounding_box, find_route_coordinates, query_tags
import route


class FlaskTests(TestCase):
    def setUp(self):
        """Set up sample data before every test."""

        self.client = app.test_client()
        app.config['TESTING'] = True

        connect_to_db(app, "postgresql:///testdb")

        db.create_all()
        example_data()

    def tearDown(self):
        """Do at end of every test."""

        db.session.close()
        db.drop_all()


    def test_query_user(self):
        """Find user in sample data"""

        drew = User.query.filter(User.username == 'drewf').first()
        self.assertEqual(drew.username, 'drewf')

    def test_query_tag(self):
        """Find tag in sample data"""

        tag = Tag.query.filter(Tag.tag_id == 760).first()
        self.assertEqual(tag.title, '15 Seconds')

    def test_landing(self):
        """Confirm landing route successful"""

        result = self.client.get('/')
        self.assertIn('Enter', result.data)

    def test_homepage(self):
        """Confirm homepage route successful"""

        result = self.client.get('/home')
        self.assertIn('Origin', result.data)

    def test_register(self):
        """Confirm registration route successful"""

        result = self.client.get('/register')
        self.assertIn('Register', result.data)



# class FlaskTestsLoggedIn(TestCase):
#     """Flask tests with user logged in to session."""

#     def setUp(self):
#         """Stuff to do before every test."""

#         app.config['TESTING'] = True
#         # app.config['SECRET_KEY'] = 'key'

#         self.client = app.test_client()
#         connect_to_db(app, "postgresql:///surfing_test")

#         # Create tables and add sample data
#         db.drop_all()
#         db.create_all()
#         example_data()
#         with self.client as c:
#             with c.session_transaction() as sess:
#                 sess['user_id'] = 1

#     def test_login_page(self):
#         """Test login page."""

#         result = self.client.get("/user/1")
#         self.assertIn("My Beaches", result.data)

#     def test_home_page(self):
#         """Test login page."""

#         result = self.client.get("/")
#         self.assertIn("View Profile", result.data)
#         self.assertNotIn("Sign Up or Log In", result.data)




class MockRouteTests(TestCase):
    """Flask tests that show off mocking."""

    def setUp(self):
        """Set up test database and mock api result."""

        self.client = app.test_client()
        app.config['TESTING'] = True
        connect_to_db(app, "postgresql:///testdb")

        db.create_all()
        example_data()

        # Make mock 
        def _mock_find_route_coordinates(origin, destination):

            return [(37.8067567, -122.2961741), (37.8070326, -122.2974171), 
                    (37.8167166, -122.2896513), (37.8276755, -122.2890558), 
                    (37.8279634, -122.2893052), (37.8280475, -122.288937), 
                    (37.8287455, -122.2891528), (37.8290338, -122.2886093), 
                    (37.8291819, -122.2886597)]

        find_route_coordinates = _mock_find_route_coordinates

    def tearDown(self):
        """Do at end of every test."""

        db.session.close()
        db.drop_all()


    def test_find_bounding_box_with_mock(self):
        bbox = find_bounding_box(find_route_coordinates)

        self.assertEqual(bbox, [BoundingBox([(37.8058, -122.298), (37.808, -122.295)]), 
                                BoundingBox([(37.806, -122.298), (37.8177, -122.289)]), 
                                BoundingBox([(37.8157, -122.291), (37.8287, -122.288)]), 
                                BoundingBox([(37.8267, -122.29), (37.829, -122.288)]), 
                                BoundingBox([(37.827, -122.29), (37.829, -122.288)]), 
                                BoundingBox([(37.827, -122.29), (37.8297, -122.288)]), 
                                BoundingBox([(37.8277, -122.29), (37.83, -122.288)]), 
                                BoundingBox([(37.828, -122.29), (37.8302, -122.288)])])

    def test_query_tags_with_mock(self):

        route_coords = find_route_coordinates(origin, destination)
        bbox = find_bounding_box(route_coords)
        tags = query_tags(bbox)

        self.assertEqual(tags[0].title, u'15 Seconds')



if __name__ == "__main__":
    import unittest

    unittest.main()




    







