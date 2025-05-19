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
import win32com.client as win32
from api.crud import save_image_and_get_base64


# Set log level
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Izinkan hanya permintaan dari http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],  # Mengizinkan semua HTTP methods
    allow_headers=["*"],  # Mengizinkan semua headers
)

# Tentukan direktori untuk menyimpan file yang di-upload
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Set log level
logging.basicConfig(level=logging.DEBUG)

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
        
        # Log the parameters to check their type
        for i, result in enumerate(dcc.results):
            logging.debug(f"Result {i} parameters type: {type(result.parameters)}")
            logging.debug(f"Result {i} parameters value: {result.parameters}")
            
            # Handle the case where parameters comes in as a string instead of list
            if isinstance(result.parameters, str):
                result.parameters = [result.parameters] if result.parameters else [""]
                logging.debug(f"Converted parameters to list: {result.parameters}")
                
            # Ensure all elements in parameters are strings
            if isinstance(result.parameters, list):
                result.parameters = [str(param) if param is not None else "" for param in result.parameters]
                logging.debug(f"Ensured all parameters are strings: {result.parameters}")
        
        # Pastikan semua data valid
        logging.debug(f"Received DCC data: {dcc}")
        
        # Validasi 'parameters' dan penyesuaian format
        for result in dcc.results:
            if not isinstance(result.parameters, list) or not all(isinstance(param, str) for param in result.parameters):
                raise HTTPException(status_code=422, detail="All 'parameters' must be an array of strings.")
            if isinstance(result.parameters, list):  # Jika parameters adalah list
                if not all(isinstance(param, str) for param in result.parameters):
                    raise HTTPException(status_code=400, detail="All parameters must be strings")
            else:
                # Jika parameters bukan list, pastikan itu adalah string
                if not isinstance(result.parameters, str):
                    raise HTTPException(status_code=400, detail="'parameters' must be a string")
        
        # Persiapkan input_tables berdasarkan data dari frontend
        input_tables = crud.prepare_input_tables(dcc)
        logging.info(f"Prepared input tables: {input_tables}")

        # Proses Excel
        if dcc.excel:
            try:
                logging.info(f"Processing Excel file: {dcc.excel}")
                
                # Try to find Excel file in different possible locations
                possible_locations = [
                    os.path.join(UPLOAD_DIR, dcc.excel),
                    os.path.join(os.path.dirname(UPLOAD_DIR), "api", "uploads", dcc.excel),
                    os.path.join(os.path.dirname(os.path.dirname(UPLOAD_DIR)), "api", "uploads", dcc.excel)
                ]
                
                excel_path = None
                for location in possible_locations:
                    if os.path.exists(location):
                        excel_path = location
                        break
                
                if not excel_path:
                    logging.error(f"Excel file {dcc.excel} not found in any of the expected locations")
                    raise HTTPException(status_code=400, detail="Excel file not found in any of the expected locations")
                
                logging.info(f"Excel file found at: {excel_path}")

                # Pass the full absolute path to the process_excel_data function
                excel_absolute_path = os.path.abspath(excel_path)
                
                # Membaca file Excel dan memproses data sesuai dengan sheet yang dimaksud
                excel_file = pd.ExcelFile(excel_absolute_path)
                sheet_names = excel_file.sheet_names
                logging.info(f"Excel file contains the following sheets: {sheet_names}")
                
                # Normalisasi nama sheet dan periksa apakah sheet yang dipilih ada
                sheet_names_normalized = [sheet.strip().replace(" ", "").lower() for sheet in sheet_names]
                normalized_sheet_name = dcc.sheet_name.strip().replace(" ", "").lower()
                
                logging.info(f"Normalized requested sheet name: {normalized_sheet_name}")
                
                if normalized_sheet_name not in sheet_names_normalized:
                    logging.error(f"Sheet '{dcc.sheet_name}' (normalized as '{normalized_sheet_name}') not found in Excel file")
                    raise HTTPException(status_code=400, detail=f"Sheet '{dcc.sheet_name}' not found in the Excel file")
                
                logging.info(f"Selected sheet '{dcc.sheet_name}' normalized to '{normalized_sheet_name}' found in the file")

                # Memeriksa sheet dengan win32 (langsung akses dengan win32)
                excel = win32.Dispatch("Excel.Application")
                excel.Visible = False
                wb = excel.Workbooks.Open(excel_absolute_path)
                
                # Gunakan metode lain untuk mendapatkan nama sheet di dalam workbook
                sheet_found = False
                for sheet in wb.Sheets:
                    # Normalisasi nama sheet
                    sheet_name_normalized = sheet.Name.strip().replace(" ", "").lower()
                    if sheet_name_normalized == normalized_sheet_name:
                        sheet_found = True
                        logging.info(f"Found matching sheet: {sheet.Name}")
                        break
                
                if not sheet_found:
                    logging.error(f"Sheet '{dcc.sheet_name}' (normalized: '{normalized_sheet_name}') does not exist in the workbook.")
                    raise HTTPException(status_code=400, detail=f"Sheet '{dcc.sheet_name}' not found in the Excel file")
                
                # Jika sheet ditemukan, lanjutkan proses dengan win32
                ws = wb.Sheets(normalized_sheet_name)

                # Melanjutkan proses dari sini
                table_data = crud.process_excel_data(excel_absolute_path, dcc.sheet_name, input_tables) 
                logging.info(f"Processed {len(table_data)} tables from the Excel sheet")
            
            except Exception as e:
                logging.error(f"Error processing Excel file: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error processing Excel file: {str(e)}")

            
        # Proses gambar metode
        if dcc.methods:
            for method in dcc.methods:
                if method.has_image and method.image:
                    if method.image.gambar:
                        try:
                            base64_str, tmp_path = save_image_and_get_base64(method.image.gambar)
                            method.image.gambar_url = tmp_path  # Word (file path)
                            method.image.base64 = base64_str     # XML (base64 string)
                            logging.info(f"Processed image for method: {method.method_name}, path: {tmp_path}")
                        except Exception as e:
                            logging.error(f"Error processing method image: {e}")
                    else:
                        logging.warning(f"Method {method.method_name} has_image=True but gambar is None")

        # Proses gambar statement
        if dcc.statements:
            for statement in dcc.statements:
                if statement.has_image and statement.image:
                    if statement.image.gambar:
                        try:
                            base64_str, tmp_path = save_image_and_get_base64(statement.image.gambar)
                            statement.image.gambar_url = tmp_path
                            statement.image.base64 = base64_str
                            logging.info(f"Processed image for statement, path: {tmp_path}")
                        except Exception as e:
                            logging.error(f"Error processing statement image: {e}")
                    else:
                        logging.warning("Statement has_image=True but gambar is None")
        
        result = crud.create_dcc(db=db, dcc=dcc) 
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
        
        if os.path.exists(file_location):
            logging.warning(f"File {excel.filename} sudah ada di {file_location}, akan digantikan.")
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(excel.file, buffer)
            
        logging.info(f"Excel file saved to {file_location}")
        
        if not os.path.exists(file_location):
            logging.error(f"Excel file was not found at {file_location}")
            raise HTTPException(status_code=500, detail="Excel file was not saved correctly.")
        
        excel_file = pd.ExcelFile(file_location)
        sheet_names = excel_file.sheet_names
        logging.info(f"Sheet names in uploaded file: {sheet_names}")

        return {"filename": excel.filename, "sheets": sheet_names}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    
# Upload Gambar
@app.post("/upload-image/")
async def upload_image(image: UploadFile = File(...)):
    try:
        if image.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Invalid image type. Only JPEG and PNG are allowed.")

        # Validasi ukuran file
        image_content = await image.read()
        if len(image_content) > 5000000:  # 5MB
            raise HTTPException(status_code=400, detail="Image size is too large. Maximum size is 5MB.")
        
        # Reset the file pointer
        await image.seek(0)
        
        # Simpan file
        image_location = os.path.join(UPLOAD_DIR, image.filename)
        with open(image_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        logging.info(f"Image file saved to {image_location}")
        
        # Create a temporary path to the image file
        temp_file = os.path.join(UPLOAD_DIR, f"temp_{image.filename}")
        shutil.copy(image_location, temp_file)
        
        return {
            "filename": image.filename, 
            "location": image_location,
            "temp_path": temp_file
        }
    except Exception as e:
        logging.error(f"Image upload failed: {str(e)}")
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

    
