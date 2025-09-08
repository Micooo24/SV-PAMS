import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get MongoDB URI from environment variables
uri = os.getenv("MONGODB_URI")
database_name = os.getenv("DATABASE_NAME")

if not uri:
    raise ValueError("MONGODB_URI not found in environment variables")

client = MongoClient(uri, server_api=ServerApi('1'))
db = client[database_name]

# # Optional: Test connection
# try:
#     client.admin.command('ping')
#     print("Successfully connected to MongoDB!")
# except Exception as e:
#     print(f"Error connecting to MongoDB: {e}")