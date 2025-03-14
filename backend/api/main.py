import logging
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import api.crud as crud
import api.models as models
import api.schemas as schemas
import api.database as database
import os
import shutil

# Set log level
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Izinkan hanya permintaan dari http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],  # Mengizinkan semua HTTP methods
    allow_headers=["*"],  # Mengizinkan semua headers
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def read_root():
    return {"message": "Selamat datang di API Digital Calibration Certificate (DCC)."}

# Dependency untuk mendapatkan sesi database
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Route untuk create-dcc
@app.post("/create-dcc/")
async def create_dcc(dcc: schemas.DCCFormCreate, db: Session = Depends(get_db)):
    try:
        logging.info(f"Received request to create DCC with Excel file: {dcc.excel}")
        result = crud.create_dcc(db=db, dcc=dcc)  # Ensure the excel filename is saved in DB
        logging.info(f"DCC Created Successfully: {result}")
        return result
    except Exception as e:
        logging.error(f"Error occurred while creating DCC: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
@app.post("/upload-excel/")
async def upload_excel(excel: UploadFile = File(...)):
    try:
        file_location = os.path.join(UPLOAD_DIR, excel.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(excel.file, buffer)
        
        print(f"Received file: {excel.filename}, Content-Type: {excel.content_type}")

        return {"filename": excel.filename, "location": file_location}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# Route untuk download-dcc
@app.get("/download-dcc/{dcc_id}")
async def download_dcc(dcc_id: int):
    try:
        # Path ke file XML
        xml_file_path = f"./dcc_files/{dcc_id}_sertifikat.xml"

        if not os.path.exists(xml_file_path):
            raise HTTPException(status_code=404, detail="File not found")

        return FileResponse(path=xml_file_path, media_type='application/xml', filename=f"DCC-{dcc_id}.xml")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading DCC: {str(e)}")