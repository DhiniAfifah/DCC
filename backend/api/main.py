import logging
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Body, status, Request, APIRouter
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from fastapi.responses import JSONResponse
from openpyxl.styles import Font, Alignment
import api.crud as crud
import api.schemas as schemas
import api.database as database
import os
import shutil
import logging
import xml.etree.ElementTree as ET
import shutil
import pandas as pd
import base64
import mimetypes
import jwt
from sqlalchemy import inspect
from api.database import engine
from openpyxl import Workbook
from xml.etree import ElementTree as ET
from .converter import convert_xml_to_excel
from .pdf_generator import PDFGenerator
from .models import DCC, DCCStatusEnum
from starlette.background import BackgroundTask
from pikepdf import Pdf, Name, String
import tempfile
import matplotlib.pyplot as plt
from jinja2 import Template, DebugUndefined
from weasyprint import HTML
import logging
from datetime import datetime
import traceback
from passlib.context import CryptContext
from .database import get_db
# Fix the import - import user module with alias to avoid naming conflicts
from . import user as user_module, schemas
import json
from . import models
from pydantic import BaseModel

# Kunci dan algoritma untuk enkripsi token
SECRET_KEY = "5965815bee66d2c201cabe787a432ba80e31884133cf6c4b8e50a0df54a0c880"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Set log level
logging.basicConfig(level=logging.INFO)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enhanced CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Directory to store uploaded files
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Digital Calibration Certificate (DCC) API."}

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

inspector = inspect(engine)
tables = inspector.get_table_names()
if 'dcc' in tables:
    print("Tabel 'dcc' ditemukan.")
else:
    print("Tabel 'dcc' tidak ditemukan.")

# Setup OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Fungsi untuk membuat token JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# FIXED: Dependency untuk mendapatkan user saat ini
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    # Fixed: Use the aliased import user_module instead of conflicting 'user'
    current_user = user_module.get_user_by_email(db, email)
    if current_user is None:
        raise credentials_exception
    return current_user

# Endpoint Register
@app.post("/register", response_model=schemas.User)
def register_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    try:
        new_user = user_module.create_user(db, user_data)
        return new_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# FIXED: Endpoint Login (Token)
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    print(f"🔐 Login attempt for user: {form_data.username}")
    
    auth_user = user_module.authenticate_user(db, form_data.username, form_data.password)
    if not auth_user:
        print(f"❌ Authentication failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"✅ Authentication successful for user: {auth_user.email}")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": auth_user.email},
        expires_delta=access_token_expires
    )
    
    print(f"🔑 Token generated successfully")
    
    # Create response with token in body
    response = JSONResponse(
        content={"access_token": access_token, "token_type": "bearer"}
    )
    
    # Set cookie with corrected settings for localhost
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=60*60*24*7,  # 7 days
        httponly=False,  # False so JavaScript can access it
        secure=False,  # False for localhost HTTP
        samesite="lax",  # Use lowercase
        path="/"  # Explicitly set path
    )
    
    print(f"🍪 Cookie set successfully with path=/ and httponly=False")
    
    return response

#LOGOUT
@app.post("/logout")
async def logout():
    print("🚪 Backend: Logout endpoint called")
    
    # Create response that clears the cookie
    response = JSONResponse(content={"message": "Logged out successfully"})
    
    # Clear cookie with multiple methods to ensure it's removed
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=False,
        secure=False,
        samesite="lax"
    )
    
    # Also set expired cookie as backup
    response.set_cookie(
        key="access_token",
        value="",
        max_age=0,
        expires=0,
        path="/",
        httponly=False,
        secure=False,
        samesite="lax"
    )
    
    print("🍪 Backend: Logout cookies cleared")
    return response

# FIXED: Endpoint untuk mendapatkan user saat ini
@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(
    current_user: schemas.User = Depends(get_current_user)
):
    print(f"✅ /users/me/ endpoint called for user: {current_user.email}")
    return current_user

# Add a simple health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# The rest of your endpoints remain the same...
# CREATE DCC
@app.post("/create-dcc/")
async def create_dcc(
    dcc: schemas.DCCFormCreate = Body(...),
    db: Session = Depends(get_db),
):
    try:
        logging.info("Received DCC JSON data")

        for method in dcc.methods:
            if method.has_image and method.image and method.image.gambar:
                filename = method.image.gambar
                file_path = os.path.join(UPLOAD_DIR, filename)
                logging.info(f"Check method image file at: {file_path}, exists: {os.path.exists(file_path)}")

                if os.path.exists(file_path):
                    mime_type = method.image.mimeType if hasattr(method.image, 'mimeType') else ""
                    with open(file_path, "rb") as img_file:
                        image_data = img_file.read()
                        base64_str = base64.b64encode(image_data).decode('utf-8')

                        method.image.base64 = base64_str
                        method.image.gambar_url = file_path
                        method.image.fileName = filename
                        method.image.mimeType = mime_type
                else:
                    logging.warning(f"Method image file {filename} not found")

        for statement in dcc.statements:
            if statement.has_image and statement.image and statement.image.gambar:
                filename = statement.image.gambar
                file_path = os.path.join(UPLOAD_DIR, filename)
                logging.info(f"Check statement image file at: {file_path}, exists: {os.path.exists(file_path)}")

                if os.path.exists(file_path):
                    mime_type = statement.image.mimeType if hasattr(statement.image, 'mimeType') else ""
                    with open(file_path, "rb") as img_file:
                        image_data = img_file.read()
                        base64_str = base64.b64encode(image_data).decode('utf-8')

                        statement.image.fileName = filename
                        statement.image.mimeType = mime_type
                        statement.image.base64 = base64_str
                        statement.image.gambar_url = file_path
                else:
                    logging.warning(f"Statement image file {filename} not found")
                             
        if dcc.comment and dcc.comment.files:
            for file in dcc.comment.files:
                if file.fileName:
                    file_path = os.path.join(UPLOAD_DIR, file.fileName)
                    if os.path.exists(file_path):
                        with open(file_path, "rb") as f:
                            base64_str = base64.b64encode(f.read()).decode('utf-8')
                        file.base64 = base64_str
                        file.mimeType = mimetypes.guess_type(file.fileName)[0] or "application/octet-stream"
                        file.fileName = file.fileName
                    else:
                        logging.warning(f"Comment file {file.fileName} not found")

        result = crud.create_dcc(db=db, dcc=dcc)
        logging.info(f"DCC Created Successfully: {result}")
        
        #PDF
        result = crud.create_dcc(db=db, dcc=dcc)
        if "pdf_path" in result:
            return FileResponse(
                result["pdf_path"],
                media_type="application/pdf",
                filename=f"{result['certificate_name']}.pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={result['certificate_name']}.pdf"
                }
            )
        else:
            raise HTTPException(status_code=500, detail="PDF generation failed")
            
    except Exception as e:
        logging.error(f"Error occurred while creating DCC: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")