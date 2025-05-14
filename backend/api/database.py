from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os


# Define the location of upload directory - ensures consistent path across all files
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
API_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')

# Create upload directories if they don't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(API_UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
# Function to find a file in multiple possible locations
def find_file(filename):
    """Search for a file in multiple possible directories"""
    possible_locations = [
        os.path.join(UPLOAD_DIR, filename),
        os.path.join(API_UPLOAD_DIR, filename)
    ]
    
    for location in possible_locations:
        if os.path.exists(location):
            return location
    
    return None

DATABASE_URL = "sqlite:///./dcc.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Membuat tabel di database jika belum ada
Base.metadata.create_all(bind=engine)
print("Tabel DCC telah dibuat.")