import logging
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Body, status, Request, APIRouter, Response
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse, StreamingResponse
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
from .models import DCC, DCCStatusEnum, UserRole
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import asyncio
from typing import AsyncGenerator

# Kunci dan algoritma untuk enkripsi token
SECRET_KEY = "5965815bee66d2c201cabe787a432ba80e31884133cf6c4b8e50a0df54a0c880"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Set log level
logging.basicConfig(level=logging.INFO)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

preview_files_dir = Path(__file__).parent.parent / "preview_files"
preview_files_dir.mkdir(exist_ok=True)

app.mount("/preview_files", StaticFiles(directory=str(preview_files_dir)), name="preview_files")

logging.info(f"Preview files directory mounted at: {preview_files_dir}")
logging.info(f"Preview files directory exists: {preview_files_dir.exists()}")

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
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "accept",
        "accept-encoding", 
        "authorization",
        "content-type",
        "dnt",
        "origin",
        "user-agent",
        "x-csrftoken",
        "x-requested-with",
        "Access-Control-Allow-Credentials",
        "Access-Control-Allow-Origin"
    ],
    expose_headers=["*"]
)

@app.middleware("http")
async def cors_handler(request: Request, call_next):
    # Log incoming request for debugging
    logger.info(f"🌐 Request: {request.method} {request.url}")
    logger.info(f"🔍 Headers: {dict(request.headers)}")
    
    if request.method == "OPTIONS":
        # Handle preflight requests explicitly with detailed logging
        logger.info("🎯 Handling CORS preflight request")
        
        origin = request.headers.get("origin")
        logger.info(f"📍 Origin: {origin}")
        
        # Create preflight response
        response = Response()
        
        # Check if origin is allowed
        allowed_origins = [
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001"
        ]
        
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            # CRITICAL: Explicitly allow authorization header (case-sensitive)
            response.headers["Access-Control-Allow-Headers"] = "accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with"
            response.headers["Access-Control-Max-Age"] = "86400"
            
            logger.info("✅ CORS preflight response headers set successfully")
        else:
            logger.warning(f"❌ Origin {origin} not allowed")
        
        return response
    
    # Process regular requests
    response = await call_next(request)
    
    # Add CORS headers to regular responses
    origin = request.headers.get("origin")
    if origin in ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    logger.info(f"✅ Response: {response.status_code}")
    return response

# Test endpoint to verify CORS is working
@app.get("/cors-test")
async def cors_test():
    return {"message": "CORS is working!", "timestamp": datetime.now().isoformat()}

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

# Dependency to ensure current user is a director
async def get_current_director(
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Dependency that ensures the current user has director role
    """
    if current_user.role != UserRole.director:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Director role required."
        )
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
    
    print(f"✅ Authentication successful for user: {auth_user.email} with role: {auth_user.role}")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": auth_user.email, "role": auth_user.role.value},  # Include role in token
        expires_delta=access_token_expires
    )
    
    print(f"🔑 Token generated successfully")
    
    # Determine redirect URL based on role
    redirect_url = "/dashboard" if auth_user.role == UserRole.director else "/home"
    
    # Create response with token and redirect info
    response = JSONResponse(
        content={
            "access_token": access_token, 
            "token_type": "bearer",
            "redirect_url": redirect_url,  # Add redirect URL to response
            "user_role": auth_user.role.value  # Add user role to response
        }
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
    
    print(f"🍪 Cookie set successfully with redirect to {redirect_url}")
    
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

@app.get("/users/me/role")
async def get_user_role(current_user: schemas.User = Depends(get_current_user)):
    """
    Get current user's role
    """
    return {"role": current_user.role.value}

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

#IMPORTER
def cleanup_file(path: str):
    """Hapus file setelah dikirim"""
    try:
        os.unlink(path)
    except Exception as e:
        logging.warning(f"Gagal menghapus file {path}: {str(e)}")

def extract_xml_from_pdf(pdf_path: str) -> str:
    """Extract embedded XML from PDF file"""
    try:
        xml_content = None
        with Pdf.open(pdf_path) as pdf:
            root = pdf.Root
            
            if Name.Names in root and Name.EmbeddedFiles in root.Names:
                embedded_files = root.Names.EmbeddedFiles
                files = embedded_files.Names
                
                for i in range(0, len(files), 2):
                    file_name = files[i]
                    
                    if isinstance(file_name, String):
                        file_name = str(file_name)
                    elif isinstance(file_name, Name):
                        file_name = str(file_name)
                    else:
                        continue
                    
                    if file_name.lower().endswith('.xml'):
                        file_spec = files[i+1]
                        if Name.EF in file_spec:
                            stream = file_spec.EF.F
                            xml_content = stream.read_bytes()
                            break

            if not xml_content and Name.EmbeddedFiles in root:
                embedded_files = root.EmbeddedFiles
                for name, file_spec in embedded_files.items():
                    # Konversi nama ke string
                    if isinstance(name, String):
                        name = str(name)
                    elif isinstance(name, Name):
                        name = str(name)
                    else:
                        continue
                    
                    if name.lower().endswith('.xml') and Name.EF in file_spec:
                        stream = file_spec.EF.F
                        xml_content = stream.read_bytes()
                        break

        if not xml_content:
            raise ValueError("PDF tidak mengandung XML yang disematkan")

        xml_filename = os.path.basename(pdf_path) + ".xml"
        xml_path = os.path.join(UPLOAD_DIR, xml_filename)
        
        with open(xml_path, "wb") as xml_file:
            xml_file.write(xml_content)
            
        return xml_path
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise RuntimeError(f"Ekstraksi XML gagal: {str(e)}")

@app.post("/upload-pdf/")
async def upload_pdf(pdf_file: UploadFile = File(...)):
    try:
        pdf_path = os.path.join(UPLOAD_DIR, pdf_file.filename)
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(pdf_file.file, buffer)

        xml_path = extract_xml_from_pdf(pdf_path)
        excel_path = convert_xml_to_excel(xml_path)
        
        return FileResponse(
            excel_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename={os.path.basename(excel_path)}"
            },
            background=BackgroundTask(cleanup_file, excel_path)  
        )

    except Exception as e:
        logging.exception("Error in upload_pdf")
        raise HTTPException(
            status_code=500, 
            detail=f"Proses PDF gagal: {str(e)}"
        )
    
@app.post("/upload-xml/")
async def upload_xml(xml_file: UploadFile = File(...)):
    try:
        xml_path = os.path.join(UPLOAD_DIR, xml_file.filename)
        with open(xml_path, "wb") as buffer:
            shutil.copyfileobj(xml_file.file, buffer)

        excel_path = convert_xml_to_excel(xml_path)
        
        return FileResponse(
            excel_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename={os.path.basename(excel_path)}"
            },
            background=BackgroundTask(cleanup_file, excel_path)  
        )

    except Exception as e:
        logging.exception("Error in upload_xml")
        raise HTTPException(
            status_code=500, 
            detail=f"Proses XML gagal: {str(e)}"
        )

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
        filename = image.filename
        mime_type = image.content_type
        file_location = os.path.join(UPLOAD_DIR, filename)

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        with open(file_location, "rb") as img_file:
            image_data = img_file.read()
            base64_str = base64.b64encode(image_data).decode('utf-8')
            base64_str = base64_str.split(",")[-1]

        return {"filename": filename, "mimeType": mime_type, "base64": base64_str, "url": f"/uploads/{filename}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#UPLOAD FILE
@app.post("/upload-file/")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate unique filename
        filename = file.filename
        mime_type = file.content_type
        file_location = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        with open(file_location, "rb") as f:
            base64_str = base64.b64encode(f.read()).decode('utf-8')
            base64_str = base64_str.split(",")[-1] 
        
        return {"filename": filename, "mimeType": mime_type, "url": f"/uploads/{filename}"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

#PDF
def generate_pdf(self, xml_path, output_path):
    """Generate PDF dari konten XML"""
    logger = logging.getLogger("PDF Generator")
    
    try:
        # Pastikan direktori output ada
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        logger.info(f"Processing XML file: {xml_path}")
        
        # Baca file XML
        with open(xml_path, 'r', encoding='utf-8') as f:
            xml_content = f.read()
        
        # Ekstrak data dari XML
        logger.info("Extracting data from XML...")
        data = self.extract_data_from_xml(xml_content)
        
        # Baca template HTML
        with open(self.template_path, 'r', encoding='utf-8') as f:
            template_html = f.read()
            
        
        # Render template
        logger.info("Rendering HTML template...")
        template = Template(template_html, undefined=DebugUndefined)
        template.globals['get_text'] = self._get_text_by_lang
        template.globals['safe_dict'] = self._safe_get_multilang_dict
        rendered_html = template.render(**data)
        
        # Generate PDF
        logger.info(f"Generating PDF to: {output_path}")
        HTML(string=rendered_html).write_pdf(
            output_path,
            pdfa='PDF/A-3b',
            metadata={
                'title': 'Digital Calibration Certificate',
                'author': 'SNSU-BSN',
                'creationDate': datetime.now()
            }
        )
        
        if os.path.exists(output_path):
            logger.info(f"PDF successfully generated: {output_path} ({os.path.getsize(output_path)} bytes)")
            return True
        else:
            logger.error("PDF generation failed - no output file created")
            return False
            
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return False
        
        return False

# DOWNLOAD XML FILE 
@app.get("/download-dcc/{dcc_id}")
async def download_dcc(dcc_id: int, db: Session = Depends(get_db)):
    try:
        # Get the DCC record from database to get the certificate ID
        dcc_record = db.query(models.DCC).filter(models.DCC.id == dcc_id).first()
        
        if not dcc_record:
            raise HTTPException(status_code=404, detail="DCC not found")
        
        # Extract certificate ID from administrative data
        admin_data = dcc_record.administrative_data
        if isinstance(admin_data, str):
            admin_data = json.loads(admin_data)
        
        certificate_id = admin_data.get('sertifikat', f'DCC-{dcc_id}')
        
        # Create filename with database ID and certificate ID
        filename_base = f"{dcc_id}_{certificate_id}"
        xml_file_path = f"./dcc_files/{filename_base}.xml"
        
        if not os.path.exists(xml_file_path):
            # Fallback to old naming convention if new file doesn't exist
            old_xml_file_path = f"./dcc_files/{certificate_id}.xml"
            if os.path.exists(old_xml_file_path):
                xml_file_path = old_xml_file_path
            else:
                raise HTTPException(status_code=404, detail="XML file not found")
        
        return FileResponse(
            path=xml_file_path, 
            media_type='application/xml', 
            filename=f"{filename_base}.xml"
        )
    
    except Exception as e:
        logging.error(f"Error downloading DCC: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading DCC: {str(e)}")

@app.get("/download-dcc-pdf/{dcc_id}")
async def download_dcc_pdf(dcc_id: int, db: Session = Depends(get_db)):
    """
    Download the PDF file for a specific DCC by database ID
    """
    try:
        # Get the DCC record from database to get the certificate ID
        dcc_record = db.query(models.DCC).filter(models.DCC.id == dcc_id).first()
        
        if not dcc_record:
            raise HTTPException(status_code=404, detail="DCC not found")
        
        # Extract certificate ID from administrative data
        admin_data = dcc_record.administrative_data
        if isinstance(admin_data, str):
            admin_data = json.loads(admin_data)
        
        certificate_id = admin_data.get('sertifikat', f'DCC-{dcc_id}')
        
        # Create filename with database ID and certificate ID (matching the format used in crud.py)
        filename_base = f"{dcc_id}_{certificate_id}"
        pdf_file_path = f"./dcc_files/{filename_base}.pdf"
        
        # Check if the PDF file exists
        if not os.path.exists(pdf_file_path):
            # Try fallback to old naming convention if new file doesn't exist
            old_pdf_file_path = f"./dcc_files/{certificate_id}.pdf"
            if os.path.exists(old_pdf_file_path):
                pdf_file_path = old_pdf_file_path
            else:
                logging.error(f"PDF file not found: {pdf_file_path}")
                raise HTTPException(status_code=404, detail="PDF file not found")
        
        # Check file size and log
        file_size = os.path.getsize(pdf_file_path)
        logging.info(f"Serving PDF file: {pdf_file_path} (Size: {file_size} bytes)")
        
        return FileResponse(
            path=pdf_file_path,
            media_type='application/pdf',
            filename=f"{filename_base}.pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename_base}.pdf"
            }
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logging.error(f"Error downloading DCC PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading PDF: {str(e)}")

# Also update the existing download-dcc endpoint to be more specific about XML downloads
@app.get("/download-dcc-xml/{dcc_id}")
async def download_dcc_xml(dcc_id: int, db: Session = Depends(get_db)):
    """
    Download the XML file for a specific DCC by database ID
    """
    try:
        # Get the DCC record from database to get the certificate ID
        dcc_record = db.query(models.DCC).filter(models.DCC.id == dcc_id).first()
        
        if not dcc_record:
            raise HTTPException(status_code=404, detail="DCC not found")
        
        # Extract certificate ID from administrative data
        admin_data = dcc_record.administrative_data
        if isinstance(admin_data, str):
            admin_data = json.loads(admin_data)
        
        certificate_id = admin_data.get('sertifikat', f'DCC-{dcc_id}')
        
        # Create filename with database ID and certificate ID
        filename_base = f"{dcc_id}_{certificate_id}"
        xml_file_path = f"./dcc_files/{filename_base}.xml"
        
        if not os.path.exists(xml_file_path):
            # Fallback to old naming convention if new file doesn't exist
            old_xml_file_path = f"./dcc_files/{certificate_id}.xml"
            if os.path.exists(old_xml_file_path):
                xml_file_path = old_xml_file_path
            else:
                raise HTTPException(status_code=404, detail="XML file not found")
        
        return FileResponse(
            path=xml_file_path, 
            media_type='application/xml', 
            filename=f"{filename_base}.xml"
        )
    
    except Exception as e:
        logging.error(f"Error downloading DCC XML: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading XML: {str(e)}")

@app.get("/api/dcc/list")
async def get_dcc_list(
    db: Session = Depends(get_db),
    skip: int = 0
):
    """Get list of all DCC certificates for dashboard"""
    try:
        # Fetch all DCC records from database
        dcc_list = db.query(models.DCC).offset(skip).all()
        
        # Transform to match frontend expectations
        result = []
        for dcc in dcc_list:
            try:
                # Parse JSON fields if they're stored as strings
                administrative_data = dcc.administrative_data
                if isinstance(administrative_data, str):
                    administrative_data = json.loads(administrative_data)
                    
                measurement_timeline = dcc.Measurement_TimeLine
                if isinstance(measurement_timeline, str):
                    measurement_timeline = json.loads(measurement_timeline)
                    
                objects_description = dcc.objects_description
                if isinstance(objects_description, str):
                    objects_description = json.loads(objects_description)
                    
                responsible_persons = dcc.responsible_persons
                if isinstance(responsible_persons, str):
                    responsible_persons = json.loads(responsible_persons)
                
                result.append({
                    "id": dcc.id,
                    "administrative_data": administrative_data,
                    "Measurement_TimeLine": measurement_timeline,
                    "objects_description": objects_description,
                    "responsible_persons": responsible_persons,
                    "created_at": dcc.created_at.isoformat() if hasattr(dcc, 'created_at') and dcc.created_at else None,
                    "status": getattr(dcc, 'status', 'pending')  # Default to pending if no status field
                })
                
            except (json.JSONDecodeError, AttributeError) as e:
                logging.warning(f"Error parsing DCC {dcc.id}: {e}")
                # Still include the record with basic info
                result.append({
                    "id": dcc.id,
                    "administrative_data": {"sertifikat": f"DCC-{dcc.id}"},
                    "Measurement_TimeLine": {},
                    "objects_description": [{"jenis": {"en": "Unknown"}}],
                    "responsible_persons": {"pelaksana": [{"name": "Unknown"}]},
                    "created_at": None,
                    "status": "pending"
                })
        
        return result
        
    except Exception as e:
        logging.error(f"Error fetching DCC list: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch DCC list")

class StatusUpdateRequest(BaseModel):
    status: DCCStatusEnum

@app.options("/api/dcc/{dcc_id}/status")
async def options_dcc_status(dcc_id: int):
    """Handle preflight requests for DCC status updates"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.patch("/api/dcc/{dcc_id}/status")
async def update_dcc_status(
    dcc_id: int,
    status_update: StatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Update the status of a DCC certificate by ID
    """
    try:
        # Find the DCC record by ID
        dcc = db.query(DCC).filter(DCC.id == dcc_id).first()
        
        if not dcc:
            raise HTTPException(
                status_code=404, 
                detail=f"DCC with ID {dcc_id} not found"
            )
        
        # Update the status
        dcc.status = status_update.status
        
        # Commit the changes
        db.commit()
        db.refresh(dcc)
        
        return {
            "message": f"DCC status updated to {status_update.status}",
            "id": dcc.id,
            "status": dcc.status
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update DCC status: {str(e)}"
        )
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Schedule cleanup of old preview files
@app.on_event("startup")
async def startup_event():
    """Clean up old preview files on startup"""
    try:
        crud.cleanup_old_preview_files(max_age_hours=24)
    except Exception as e:
        logging.warning(f"Error during startup cleanup: {e}")

# Background task to periodically clean up preview files
async def periodic_cleanup():
    """Periodically clean up old preview files"""
    while True:
        try:
            await asyncio.sleep(3600)  # Run every hour
            crud.cleanup_old_preview_files(max_age_hours=24)
        except Exception as e:
            logging.error(f"Error in periodic cleanup: {e}")

# Start background cleanup task
@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(periodic_cleanup())

# PREVIEW ENDPOINT
@app.post("/generate-preview/")
async def generate_preview(
    dcc: schemas.DCCFormCreate = Body(...),
):
    """
    Generate preview PDF and XML files from DCC data without saving to database
    """
    try:
        logging.info("Received preview request")
        
        # Process images for preview (same as in create_dcc but for preview)
        for method in dcc.methods:
            if method.has_image and method.image and method.image.gambar:
                filename = method.image.gambar
                file_path = os.path.join(UPLOAD_DIR, filename)
                
                if os.path.exists(file_path):
                    mime_type = method.image.mimeType if hasattr(method.image, 'mimeType') else ""
                    with open(file_path, "rb") as img_file:
                        image_data = img_file.read()
                        base64_str = base64.b64encode(image_data).decode('utf-8')

                        method.image.base64 = base64_str
                        method.image.fileName = filename
                        method.image.mimeType = mime_type

        for statement in dcc.statements:
            if statement.has_image and statement.image and statement.image.gambar:
                filename = statement.image.gambar
                file_path = os.path.join(UPLOAD_DIR, filename)
                
                if os.path.exists(file_path):
                    mime_type = statement.image.mimeType if hasattr(statement.image, 'mimeType') else ""
                    with open(file_path, "rb") as img_file:
                        image_data = img_file.read()
                        base64_str = base64.b64encode(image_data).decode('utf-8')

                        statement.image.fileName = filename
                        statement.image.mimeType = mime_type
                        statement.image.base64 = base64_str

        # Process comment files
        if dcc.comment and dcc.comment.files:
            for file in dcc.comment.files:
                if file.fileName:
                    file_path = os.path.join(UPLOAD_DIR, file.fileName)
                    if os.path.exists(file_path):
                        with open(file_path, "rb") as f:
                            base64_str = base64.b64encode(f.read()).decode('utf-8')
                        file.base64 = base64_str
                        file.mimeType = mimetypes.guess_type(file.fileName)[0] or "application/octet-stream"

        # Generate preview files
        result = crud.generate_preview_files(dcc=dcc)
        
        logging.info(f"Preview generated successfully: {result}")
        
        return {
            "message": "Preview generated successfully",
            "pdf_url": result["pdf_url"],
            "xml_url": result["xml_url"],
            "preview_id": result["preview_id"]
        }
        
    except Exception as e:
        logging.error(f"Preview generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Preview generation failed: {str(e)}")

# CLEANUP PREVIEW ENDPOINT (optional - for manual cleanup)
@app.delete("/cleanup-preview/{preview_id}")
async def cleanup_preview(preview_id: str):
    """
    Manually clean up specific preview files
    """
    try:
        crud.cleanup_preview_files(preview_id)
        return {"message": f"Preview files for {preview_id} cleaned up successfully"}
    except Exception as e:
        logging.error(f"Preview cleanup error: {e}")
        raise HTTPException(status_code=500, detail=f"Preview cleanup failed: {str(e)}")

# CLEANUP ALL OLD PREVIEWS ENDPOINT (optional - for manual cleanup)
@app.post("/cleanup-old-previews/")
async def cleanup_old_previews(max_age_hours: int = 24):
    """
    Manually clean up old preview files
    """
    try:
        crud.cleanup_old_preview_files(max_age_hours)
        return {"message": f"Old preview files (>{max_age_hours}h) cleaned up successfully"}
    except Exception as e:
        logging.error(f"Old preview cleanup error: {e}")
        raise HTTPException(status_code=500, detail=f"Old preview cleanup failed: {str(e)}")

# HEALTH CHECK FOR PREVIEW SYSTEM
@app.get("/preview-health")
async def preview_health_check():
    """
    Check if preview system is working
    """
    try:
        # Check if preview directory exists
        backend_root = Path(__file__).parent.parent
        preview_dir = backend_root / "preview_files"
        
        return {
            "status": "healthy",
            "preview_directory_exists": preview_dir.exists(),
            "preview_directory_path": str(preview_dir),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
    
@app.get("/api/preview/{file_id}")
async def serve_preview_file(file_id: str):
    """
    Serve preview files with proper headers and error handling
    """
    try:
        # Construct file path
        file_path = preview_files_dir / file_id
        
        logging.info(f"Attempting to serve preview file: {file_path}")
        logging.info(f"File exists: {file_path.exists()}")
        
        if not file_path.exists():
            logging.error(f"Preview file not found: {file_path}")
            raise HTTPException(status_code=404, detail=f"Preview file not found: {file_id}")
        
        # Determine content type based on file extension
        if file_path.suffix.lower() == '.pdf':
            media_type = 'application/pdf'
        elif file_path.suffix.lower() == '.xml':
            media_type = 'application/xml'
        else:
            media_type = 'application/octet-stream'
        
        logging.info(f"Serving file with media type: {media_type}")
        
        return FileResponse(
            file_path,
            media_type=media_type,
            headers={
                "Content-Disposition": f"inline; filename={file_path.name}",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error serving preview file {file_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error serving preview file: {str(e)}")

# Add a debug endpoint to list preview files
@app.get("/api/preview-debug/")
async def debug_preview_files():
    """Debug endpoint to check preview files"""
    try:
        files = []
        if preview_files_dir.exists():
            for file_path in preview_files_dir.glob("*"):
                if file_path.is_file():
                    files.append({
                        "name": file_path.name,
                        "size": file_path.stat().st_size,
                        "exists": True,
                        "full_path": str(file_path)
                    })
        
        return {
            "preview_directory": str(preview_files_dir),
            "directory_exists": preview_files_dir.exists(),
            "files": files,
            "total_files": len(files)
        }
    except Exception as e:
        return {
            "error": str(e),
            "preview_directory": str(preview_files_dir),
            "directory_exists": False
        }
    
@app.post("/create-dcc-streaming/")
async def create_dcc_streaming(
    dcc: schemas.DCCFormCreate = Body(...),
    db: Session = Depends(get_db),
):
    # Create a queue for progress updates
    progress_queue = asyncio.Queue()
    
    async def progress_generator() -> AsyncGenerator[str, None]:
        try:
            # Send initial progress
            yield f"data: {json.dumps({'progress': 10, 'message': 'Starting DCC creation...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Process images
            yield f"data: {json.dumps({'progress': 20, 'message': 'Processing images and files...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Process method and statement images (same as original code)
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
            
            for statement in dcc.statements:
                if statement.has_image and statement.image and statement.image.gambar:
                    filename = statement.image.gambar
                    file_path = os.path.join(UPLOAD_DIR, filename)
                    
                    if os.path.exists(file_path):
                        mime_type = statement.image.mimeType if hasattr(statement.image, 'mimeType') else ""
                        with open(file_path, "rb") as img_file:
                            image_data = img_file.read()
                            base64_str = base64.b64encode(image_data).decode('utf-8')

                            statement.image.fileName = filename
                            statement.image.mimeType = mime_type
                            statement.image.base64 = base64_str
                            statement.image.gambar_url = file_path
                             
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
            
            # Create progress callback function that puts updates in queue
            def progress_callback(progress, message):
                # Put progress update in queue (non-blocking)
                try:
                    progress_queue.put_nowait((progress, message))
                except asyncio.QueueFull:
                    pass  # Skip if queue is full
            
            # Start the DCC creation task
            loop = asyncio.get_event_loop()
            
            # Create a task for the DCC creation
            dcc_task = loop.run_in_executor(None, crud.create_dcc, db, dcc, progress_callback)
            
            # Monitor for progress updates while the task runs
            result = None
            while not dcc_task.done():
                try:
                    # Wait for progress update with timeout
                    progress, message = await asyncio.wait_for(progress_queue.get(), timeout=1.0)
                    yield f"data: {json.dumps({'progress': progress, 'message': message})}\n\n"
                except asyncio.TimeoutError:
                    # No progress update received, continue waiting
                    continue
            
            # Get the final result
            result = await dcc_task
            
            # Process any remaining progress updates
            while not progress_queue.empty():
                try:
                    progress, message = progress_queue.get_nowait()
                    yield f"data: {json.dumps({'progress': progress, 'message': message})}\n\n"
                except asyncio.QueueEmpty:
                    break
            
            yield f"data: {json.dumps({'progress': 95, 'message': 'Finalizing...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Send completion with download URL
            if "pdf_path" in result:
                download_url = f"/download-dcc-pdf/{result['database_id']}"
                yield f"data: {json.dumps({'progress': 100, 'message': 'DCC created successfully!', 'download_url': download_url, 'certificate_name': result['certificate_name']})}\n\n"
            else:
                yield f"data: {json.dumps({'progress': 0, 'error': 'PDF generation failed'})}\n\n"
                
        except Exception as e:
            logging.error(f"Error in streaming DCC creation: {e}", exc_info=True)
            yield f"data: {json.dumps({'progress': 0, 'error': f'Internal Server Error: {str(e)}'})}\n\n"

    return StreamingResponse(
        progress_generator(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )
