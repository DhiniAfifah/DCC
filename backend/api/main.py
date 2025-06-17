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
from .models import DCC
from starlette.background import BackgroundTask
from pikepdf import Pdf, Name, String
import tempfile
import matplotlib.pyplot as plt
from jinja2 import Template, DebugUndefined
from weasyprint import HTML
import logging
from datetime import datetime
import traceback

#from slowapi import Limiter
#from slowapi.errors import RateLimitExceeded

# Kunci dan algoritma untuk enkripsi token
SECRET_KEY = "5965815bee66d2c201cabe787a432ba80e31884133cf6c4b8e50a0df54a0c880"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Set log level
#logging.basicConfig(level=logging.DEBUG)
logging.basicConfig(level=logging.INFO)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    #allow_origins=origins,
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


inspector = inspect(engine)
tables = inspector.get_table_names()
if 'dcc' in tables:
    print("Tabel 'dcc' ditemukan.")
else:
    print("Tabel 'dcc' tidak ditemukan.")

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

# Fungsi memverifikasi kata sandi
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Fungsi untuk membuat password yang di-hash
def get_password_hash(password: str):
    return pwd_context.hash(password)

# Fungsi memverifikasi pengguna
def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return False
    return user

# Fungsi token JWT
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
                        file.mimeType = mimetypes.guess_type(file.fileName)[0] or "application/octet-stream"
                        file.fileName = file.fileName
                    else:
                        logging.warning(f"Comment file {file.fileName} not found")


        # Continue with other processing
        result = crud.create_dcc(db=db, dcc=dcc)
        logging.info(f"DCC Created Successfully: {result}")
        
        
        try:
            paths = crud.get_project_paths(dcc)
            xml_path = paths['xml_output']
            pdf_path = paths['pdf_output']

            # Pastikan direktori output ada
            os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
            
            logging.info(f"XML path: {xml_path}")
            logging.info(f"PDF path: {pdf_path}")
            
            if os.path.exists(xml_path):
                logging.info(f"XML file exists, size: {os.path.getsize(xml_path)} bytes")
                
                # Gunakan PDFGenerator
                pdf_generator = PDFGenerator()
                success = pdf_generator.generate_pdf(str(xml_path), str(pdf_path))
                
                if success:
                    logging.info(f"PDF generated at: {pdf_path}")
                    # Berikan response dengan link download
                    return {
                        "message": "DCC created successfully",
                        "pdf_url": f"/generate-pdf/{dcc.administrative_data.sertifikat}"
                    }
                else:
                    logging.error("PDF generation failed during DCC creation")
                    return JSONResponse(
                        status_code=500,
                        content={"detail": "PDF generation failed"}
                    )
            else:
                logging.error(f"XML file not found at: {xml_path}")
                return JSONResponse(
                    status_code=404,
                    content={"detail": "XML file not found"}
                )
        except Exception as e:
            logging.exception("Error during PDF generation")
            return JSONResponse(
                status_code=500,
                content={"detail": f"PDF generation error: {str(e)}"}
            )

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
async def download_dcc(dcc_id: int):
    try:
        xml_file_path = f"./dcc_files/{dcc_id}_sertifikat.xml"
        if not os.path.exists(xml_file_path):
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(path=xml_file_path, media_type='application/xml', filename=f"DCC-{dcc_id}.xml")
    
    except Exception as e:
        logging.error(f"Error downloading DCC: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading DCC: {str(e)}")
