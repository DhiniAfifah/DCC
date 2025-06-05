import logging
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Body, status
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import api.crud as crud
import api.schemas as schemas
import api.database as database
import os
import shutil
import pandas as pd
import base64
import uuid
import mimetypes
import jwt

# Kunci dan algoritma untuk enkripsi token
SECRET_KEY = "5965815bee66d2c201cabe787a432ba80e31884133cf6c4b8e50a0df54a0c880"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# Set log level
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
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


#LOGIN
# Setup untuk password hashing
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Simulasi database pengguna
fake_users_db = {
    "BSN@gmail.com": {
        "username": "BSN@gmail.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  #secret
    }
}

# Fungsi untuk memverifikasi kata sandi
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Fungsi untuk memverifikasi pengguna
def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return False
    return user

# Fungsi untuk membuat token JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# TOKEN
@app.post("/token", response_model=schemas.Token) 
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Endpoint login untuk mendapatkan token. Menerima username dan password dari form.
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# CREATE DCC
@app.post("/create-dcc/")
async def create_dcc(
    dcc: schemas.DCCFormCreate = Body(...),
    db: Session = Depends(get_db),
):
    try:
        logging.info("Received DCC JSON data")

        # Process files if they exist
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
                        # Cari mimeType berdasarkan ekstensi file
                        file.mimeType = mimetypes.guess_type(file.fileName)[0] or "application/octet-stream"
                        # fileName sudah pasti ada dari input, bisa dibiarkan atau assign ulang
                        file.fileName = file.fileName
                    else:
                        logging.warning(f"Comment file {file.fileName} not found")

        # Continue with other processing
        result = crud.create_dcc(db=db, dcc=dcc)
        logging.info(f"DCC Created Successfully: {result}")
        return result

    except Exception as e:
        logging.error(f"Error occurred while creating DCC: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


# EXCEL FILE 
@app.post("/upload-excel/")
async def upload_excel(excel: UploadFile = File(...)):
    try:
        file_location = os.path.join(UPLOAD_DIR, excel.filename)
        if os.path.exists(file_location):
            logging.warning(f"File {excel.filename} already exists, it will be overwritten.")
        
        # Save the uploaded Excel file
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(excel.file, buffer)
        
        logging.info(f"Excel file saved to {file_location}")
        
        # Process the uploaded Excel file to get sheet names
        excel_file = pd.ExcelFile(file_location)
        sheet_names = excel_file.sheet_names
        return {"filename": excel.filename, "sheets": sheet_names}
    
    except Exception as e:
        logging.error(f"File upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# IMAGE FILE
@app.post("/upload-image/")
async def upload_image(image: UploadFile = File(...)):
    try:
        # Generate unique filename
        filename = f"{uuid.uuid4()}_{image.filename}"
        mime_type = image.content_type
        file_location = os.path.join(UPLOAD_DIR, filename)

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        return {"filename": filename, "mimeType": mime_type, "url": f"/uploads/{filename}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#UPLOAD FILE
@app.post("/upload-file/")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate unique filename
        filename = f"{uuid.uuid4()}_{file.filename}"
        mime_type = file.content_type
        file_location = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {"filename": filename, "mimeType": mime_type, "url": f"/uploads/{filename}"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# DOWNLOAD XML FILE 
@app.get("/download-dcc/{dcc_id}")
async def download_dcc(dcc_id: int):
    try:
        xml_file_path = f"./dcc_files/{dcc_id}_sertifikat.xml"
        if not os.path.exists(xml_file_path):
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(path=xml_file_path, media_type='application/xml', filename=f"DCC-{dcc_id}.xml")
    
    except Exception as e:
        logging.error(f"Error downloading DCC: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading DCC: {str(e)}")
