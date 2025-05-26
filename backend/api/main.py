import logging
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, Request, Body
from typing import List
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import api.crud as crud
import api.schemas as schemas
import api.database as database
import os
import shutil
import json
import pandas as pd
import base64
import tempfile
import uuid

# Set log level
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  # You can set this to your frontend URL for better security
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
