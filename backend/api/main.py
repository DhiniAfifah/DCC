from fastapi import FastAPI, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from models import DCCForm
from schemas import DCCFormCreate
import shutil
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import Base, engine
from models import UsedLanguage, MandatoryLanguage, DCCObject, DCCPerson, DCCOwner, DCCStatement

app = FastAPI()

# Tambahkan endpoint root
@app.get("/")
async def root():
    return {"message": "Welcome to DCC API!"}

# Membuat tabel-tabel yang didefinisikan di model
Base.metadata.create_all(bind=engine)

# 🔹 Hitung path ke direktori "backend/"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Dapatkan path "backend/"
ASSETS_DIR = os.path.join(BASE_DIR, "assets")  # Path ke "backend/assets"
GENERATED_DIR = os.path.join(ASSETS_DIR, "generated")  # Path ke "backend/assets/generated"

# 🔹 Pastikan folder "assets" dan "generated" ada
os.makedirs(GENERATED_DIR, exist_ok=True)

# 🔹 Mount folder "assets" agar file bisa diakses dari frontend
app.mount("/static", StaticFiles(directory=ASSETS_DIR), name="static")

# 🔹 Tambahkan CORS Middleware agar backend bisa menerima request dari frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Bisa diganti dengan frontend URL tertentu (misalnya ["http://localhost:3000"])
    allow_credentials=True,
    allow_methods=["*"],  # Mengizinkan semua metode (GET, POST, OPTIONS, dll.)
    allow_headers=["*"],  # Mengizinkan semua header
)

# Dependency untuk database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/create-dcc/")
async def create_dcc(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        print("Data diterima dari frontend:", data)  # 🔹 Debugging: Print data yang dikirim

        # Validasi data sebelum diproses
        form_data = DCCFormCreate(**data)
        print("Data sudah sesuai dengan schemas.py")

    except Exception as e:
        print("ERROR membaca data:", str(e))
        raise HTTPException(status_code=400, detail=f"Invalid request body: {str(e)}")

    # Simpan data ke database
    # Extract related objects separately
    form_data_dict = form_data.model_dump(exclude={"used_languages", "mandatory_languages", "objects", "persons", "owner", "statements"}, exclude_unset=True)

    # Create DCCForm instance **without relationships**
    dcc = DCCForm(**form_data_dict)

    # Manually assign relationships (if applicable)
    dcc.used_languages = [UsedLanguage(**lang.model_dump()) for lang in form_data.used_languages] if form_data.used_languages else []
    dcc.mandatory_languages = [MandatoryLanguage(**lang.model_dump()) for lang in form_data.mandatory_languages] if form_data.mandatory_languages else []
    dcc.objects = [DCCObject(**obj.model_dump()) for obj in form_data.objects] if form_data.objects else []
    dcc.persons = [DCCPerson(**person.model_dump()) for person in form_data.persons] if form_data.persons else []
    dcc.owner = DCCOwner(**form_data.owner.model_dump()) if form_data.owner else None
    dcc.statements = [DCCStatement(value=stmt) for stmt in form_data.statements]

    db.add(dcc)
    db.commit()
    db.refresh(dcc)

    # Cek apakah ID sudah dibuat
    if not dcc.id:
        raise HTTPException(status_code=500, detail="Failed to generate DCC ID")

    # Path untuk template dan output sertifikat
    template_path = os.path.join(ASSETS_DIR, "dcc_template.pdf")  
    output_path = os.path.join(GENERATED_DIR, f"DCC_{dcc.id}.pdf")  

    shutil.copy(template_path, output_path)

    download_url = f"http://127.0.0.1:8000/static/generated/DCC_{dcc.id}.pdf"
    print("Sertifikat disimpan di:", output_path)
    print("Link download:", download_url)

    return {"message": "DCC Created!", "download_link": download_url}
