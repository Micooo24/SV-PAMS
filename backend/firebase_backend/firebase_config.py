import firebase_admin
from firebase_admin import credentials
import os

# Get absolute path relative to THIS file's location
current_dir = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(current_dir, "sv-pams-477706-firebase-adminsdk-fbsvc-13b4d78761.json")

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)