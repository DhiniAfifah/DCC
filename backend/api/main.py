import logging
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from api.constants import kepala_lab_roles, direktur_roles
import api.crud as crud
import api.models as models
import api.schemas as schemas
import api.database as database
import os
import shutil
import pandas as pd

# Set log level
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  # Izinkan hanya permintaan dari http://localhost:3000
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
        
        # Pastikan semua data valid
        logging.debug(f"Received DCC data: {dcc}")
        
        # Validasi 'parameters' dan penyesuaian format
        for result in dcc.results:
            if not hasattr(result, 'parameters'):
                raise HTTPException(status_code=400, detail="Missing 'parameters' in result")
            if isinstance(result.parameters, list):  # Jika parameters adalah list
                if not all(isinstance(param, str) for param in result.parameters):
                    raise HTTPException(status_code=400, detail="All parameters must be strings")
            else:
                # Jika parameters bukan list, pastikan itu adalah string
                if not isinstance(result.parameters, str):
                    raise HTTPException(status_code=400, detail="'parameters' must be a string")
        
        # Definisikan input_tables
        input_tables = {}
        for result in dcc.results:
            parameter_name = result.parameters
            if parameter_name not in table_data:
                logging.warning(f"Table '{parameter_name}' not found in Excel data") 
                continue
            column_mapping = {}
            for column in result.columns:
                column_name = column.kolom
                num_subcols = int(column.real_list) if isinstance(column.real_list, str) else len(column.real_list)
                column_mapping[column_name] = num_subcols
            if hasattr(result, 'uncertainty'):
                uncertainty_column = "Uncertainty"
                column_mapping[uncertainty_column] = 1
            
            input_tables[parameter_name] = column_mapping

        # Proses Excel
        if dcc.excel:
            try:
                logging.info(f"Processing Excel file: {dcc.excel}")
                excel_path = os.path.join(UPLOAD_DIR, dcc.excel)
                if not os.path.exists(excel_path):
                    logging.error(f"Excel file {dcc.excel} not found at {excel_path}")
                    raise HTTPException(status_code=400, detail="Excel file not found")

                # Membaca file Excel dan memproses data sesuai dengan sheet yang dimaksud
                excel_file = pd.ExcelFile(excel_path)
                sheet_names = excel_file.sheet_names
                logging.info(f"Excel file contains the following sheets: {sheet_names}")
                if dcc.sheet_name not in sheet_names:
                    logging.error(f"Sheet {dcc.sheet_name} not found in Excel file")
                    raise HTTPException(status_code=400, detail=f"Sheet '{dcc.sheet_name}' not found in the Excel file")

                # Proses data dari sheet yang dipilih
                logging.info(f"Processing data from sheet: {dcc.sheet_name}")
                table_data = crud.process_excel_data(dcc.excel, dcc.sheet_name, input_tables)  # Menggunakan fungsi dari crud.py
                logging.info(f"Processed {len(table_data)} tables from the Excel sheet")
            except Exception as e:
                logging.error(f"Error processing Excel file: {str(e)}")
                raise HTTPException(status_code=500, detail="Error processing Excel file")
            
        # Proses gambar untuk metode pengukuran
        if dcc.methods:
            for method in dcc.methods:
                if method.has_image and method.image and method.image.gambar:
                    image = method.image.gambar
                    image_path = os.path.join(UPLOAD_DIR, image.filename)
                    logging.info(f"Processing image for method: {method.method_name}")
                    try:
                        with open(image_path, "wb") as buffer:
                            shutil.copyfileobj(image.file, buffer)
                        method.image.gambar_url = f"/uploads/{image.filename}"
                        logging.info(f"Image for method '{method.method_name}' saved at {image_path}")
                    except Exception as e:
                        logging.error(f"Error processing image for method '{method.method_name}': {str(e)}")
                        raise HTTPException(status_code=500, detail=f"Error processing image for method: {method.method_name}")

        # Proses gambar untuk pernyataan
        if dcc.statements:
            for index, statement in enumerate(dcc.statements):
                if statement.has_image and statement.image and statement.image.gambar:
                    image = statement.image.gambar
                    logging.debug(f"Received image for statement {index}: {image.filename}")
                    try:
                        image_path = os.path.join(UPLOAD_DIR, image.filename)
                        with open(image_path, "wb") as buffer:
                            shutil.copyfileobj(image.file, buffer)
                        statement.image.gambar_url = f"/uploads/{image.filename}"
                        logging.info(f"Image for statement {index} saved at {image_path}")
                    except Exception as e:
                        logging.error(f"Error processing image for statement {index}: {str(e)}")
                        raise HTTPException(status_code=500, detail=f"Error processing image for statement: {index}")
                    
        
        result = crud.create_dcc(db=db, dcc=dcc)  # Ensure the excel filename is saved in DB
        logging.info(f"DCC Created Successfully: {result}")
        return result
    except Exception as e:
        logging.error(f"Error occurred while creating DCC: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

#Excel
@app.post("/upload-excel/")
async def upload_excel(excel: UploadFile = File(...)):
    try:
        file_location = os.path.join(UPLOAD_DIR, excel.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(excel.file, buffer)
        logging.info(f"Excel file saved to {file_location}")
        
        excel_file = pd.ExcelFile(file_location)
        sheet_names = excel_file.sheet_names
        #print(f"Received file: {excel.filename}, Content-Type: {excel.content_type}")
        logging.info(f"Sheet names in uploaded file: {sheet_names}")

        return {"filename": excel.filename, "sheets": sheet_names}
        #return {"filename": excel.filename, "location": file_location}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    
# Upload Gambar
@app.post("/upload-image/")
async def upload_image(image: UploadFile = File(...)):
    try:
        if image.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Invalid image type. Only JPEG and PNG are allowed.")

        # Validasi ukuran file
        image_file = await image.read()
        if len(image_file) > 5000000:  # 5MB
            raise HTTPException(status_code=400, detail="Image size is too large. Maximum size is 5MB.")
        
        
        # Simpan file
        image_location = os.path.join(UPLOAD_DIR, image.filename)
        with open(image_location, "wb") as buffer:
            buffer.write(image_file)

        logging.info(f"Image file saved to {image_location}")
        
        return {"filename": image.filename, "location": image_location}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

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

    
