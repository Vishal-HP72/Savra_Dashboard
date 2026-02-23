from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load .env from same directory
load_dotenv()

app = Flask(__name__)

# Allow React frontend
CORS(app)

# Read credentials from .env
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")

# Combine if you like
app.config["MONGO_URI"] = f"{MONGO_URI}{MONGO_DB}"

mongo = PyMongo(app)

from routes import *

if __name__ == "__main__":
    app.run(debug=True)