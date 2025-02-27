import logging
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
import api.crud as crud
import api.models as models
import api.schemas as schemas
import api.database as database
import os

# Set log level
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

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
        logging.info("Received request to create DCC")
        result = crud.create_dcc(db=db, dcc=dcc)
        logging.info(f"DCC Created Successfully: {result}")
        return result
    except Exception as e:
        logging.error(f"Error occurred while creating DCC: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Route untuk download-dcc
@app.get("/download-dcc/{dcc_id}")
async def download_dcc(dcc_id: int, db: Session = Depends(get_db)):
    try:
        # Cari DCC berdasarkan ID
        dcc_data = db.query(models.DCC).filter(models.DCC.id == dcc_id).first()
        if not dcc_data:
            raise HTTPException(status_code=404, detail="DCC not found")

        # Tentukan lokasi file yang akan didownload
        file_path = f"./dcc_files/{dcc_id}.pdf"  
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        # Mengirim file sebagai response
        return FileResponse(path=file_path, media_type='application/pdf', filename=f"DCC-{dcc_id}.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading DCC: {str(e)}")