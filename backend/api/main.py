import logging
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import api.crud as crud
import api.models as models
import api.schemas as schemas
import api.database as database
import os
import json
from io import BytesIO
from openpyxl import load_workbook
from docx import Document
import win32com.client as win32

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

# Fungsi untuk mendeteksi rentang tabel di Excel
def detect_table_range(ws):
    first_row, last_row = None, None
    first_col, last_col = None, None
    
    max_columns = ws.UsedRange.Columns.Count  
    
    # Mencari baris pertama dan terakhir yang mengandung data
    for row in range(1, ws.UsedRange.Rows.Count + 1):
        filled_cells = [ws.Cells(row, col).Value for col in range(1, max_columns + 1)]
        filled_cells = [cell for cell in filled_cells if cell not in [None, ""]]
        
        if len(filled_cells) > 2:  
            if first_row is None:
                first_row = row
            last_row = row

    # Mencari kolom pertama dan terakhir yang mengandung data
    for col in range(1, max_columns + 1):
        col_has_data = any(ws.Cells(row, col).Value not in [None, ""] for row in range(first_row, last_row + 1))
        if col_has_data:
            if first_col is None:
                first_col = col
            last_col = col

    # Mengembalikan rentang tabel dalam bentuk alamat cell
    if first_row and first_col and last_row and last_col:
        start_cell = ws.Cells(first_row, first_col).Address.replace("$", "")
        end_cell = ws.Cells(last_row, last_col).Address.replace("$", "")
        return start_cell, end_cell
    
    return None, None

# Fungsi untuk memindahkan data Excel ke Word
def copy_paste_excel_to_word(word, word_path, ws, start_cell, end_cell):
    print(f"Copying table from Excel to Word... Start cell: {start_cell}, End cell: {end_cell}")
    
    # Mendapatkan range tabel
    table_range = f"{start_cell}:{end_cell}"
    ws.Range(table_range).Copy()

    # Membuka file Word
    doc = word.Documents.Open(word_path)
    
    # Mencari placeholder {{ tabel }}
    find_text = "{{ tabel }}"
    find = word.Selection.Find
    find.Text = find_text
    find.Execute()

    if find.Found:
        print("Placeholder found. Inserting table...")
        word.Selection.Paste() 
    else:
        print("Placeholder '{{ tabel }}' not found in the document.")
    
    doc.SaveAs(word_path)
    doc.Close()
    print(f"Tabel berhasil disalin ke {word_path}")

# Fungsi untuk memasukkan data ke template Word
def insert_into_word_template(excel_data, template_path):
    # Membuka file template
    doc = Document(template_path)

    # Menambahkan data ke dalam template Word (misalnya memasukkan data tabel)
    table = doc.tables[0]
    for row_data in excel_data:
        row = table.add_row().cells
        for idx, cell in enumerate(row):
            cell.text = str(row_data[idx])

    # Simpan hasil yang telah diubah
    doc.save("output_path_here")


# Route untuk create-dcc
@app.post("/create-dcc/")
async def create_dcc(
    software: str = Form(...),
    version: str = Form(...),
    sertifikat: str = Form(...),
    order: str = Form(...),
    methods: str = Form(...),  # Methods
    equipments: str = Form(...),  # Equipments
    conditions: str = Form(...),  # Conditions
    file: UploadFile = File(...),  # File Excel
    db: Session = Depends(get_db)
):
    try:
        logging.info("Received request to create DCC")
        
        # Ensure all form fields are received
        if not all([software, version, sertifikat, order, methods, equipments, conditions, file]):
            raise HTTPException(status_code=422, detail="Missing one or more required fields")

        print(f"Received data: {software}, {version}, {sertifikat}, {order}")
        print(f"Methods: {methods}")
        print(f"Equipments: {equipments}")
        print(f"Conditions: {conditions}")
        print(f"File: {file.filename}")
        
        if not all([software, version, sertifikat, order, methods, equipments, conditions, file]):
            raise HTTPException(status_code=422, detail="Missing one or more required fields")


        # Membaca file Excel
        contents = await file.read()
        workbook = load_workbook(filename=BytesIO(contents))
        sheet = workbook.active  # Mengambil sheet pertama
        
        # Menginisialisasi Excel menggunakan win32com
        excel = win32.Dispatch("Excel.Application")
        word = win32.Dispatch("Word.Application")
        excel.Visible = False
        word.Visible = True

        # Membuka file Excel dan memilih sheet
        excel_path = "/path/to/your/excel/file.xlsx"  # Ganti dengan path file Excel
        wb = excel.Workbooks.Open(excel_path)
        ws = wb.Sheets("Sheet1")  # Ganti dengan nama sheet yang sesuai

        # Mendapatkan tabel dari Excel
        start_cell, end_cell = detect_table_range(ws)  # Fungsi untuk mendeteksi range tabel
        copy_paste_excel_to_word(word, word_path="template_path_here", ws=ws, start_cell=start_cell, end_cell=end_cell)

        # Proses data manual yang dimasukkan
        methods = json.loads(methods)  # Mengonversi string JSON ke objek
        equipments = json.loads(equipments)  # Mengonversi string JSON ke objek
        conditions = json.loads(conditions)  # Mengonversi string JSON ke objek

        # Buka template Word
        doc = Document("template DCC (4).docx")  # Path template Word
        table = doc.tables[0]

        # Memasukkan data dari Excel ke dalam tabel Word
        for row_data in sheet.iter_rows(min_row=2, values_only=True):
            row = table.add_row().cells
            for idx, cell in enumerate(row):
                cell.text = str(row_data[idx])

        # Mengganti placeholder di template Word dengan data manual
        for para in doc.paragraphs:
            if "{{ software }}" in para.text:
                para.text = para.text.replace("{{ software }}", software)
            if "{{ version }}" in para.text:
                para.text = para.text.replace("{{ version }}", version)
            if "{{ sertifikat }}" in para.text:
                para.text = para.text.replace("{{ sertifikat }}", sertifikat)
            if "{{ order }}" in para.text:
                para.text = para.text.replace("{{ order }}", order)
            if "{{ methods }}" in para.text:
                para.text = para.text.replace("{{ methods }}", str(methods))
            if "{{ equipments }}" in para.text:
                para.text = para.text.replace("{{ equipments }}", str(equipments))
            if "{{ conditions }}" in para.text:
                para.text = para.text.replace("{{ conditions }}", str(conditions))

        # Simpan dokumen Word yang telah diperbarui
        word_file_path = f"./dcc_files/{sertifikat}_output.docx"
        doc.save(word_file_path)

        return {"message": "DCC Created Successfully", "word_file": word_file_path}

    except Exception as e:
        logging.error(f"Error occurred while creating DCC: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Endpoint untuk upload file Excel
@app.post("/upload-excel/")
async def upload_excel(file: UploadFile = File(...)):
    # Validasi ekstensi file
    if not (file.filename.endswith(".xlsx") or file.filename.endswith(".xls")):
        raise HTTPException(status_code=400, detail="File harus berformat .xlsx atau .xls")
    
    # Validasi tipe MIME
    if file.content_type not in ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
        raise HTTPException(status_code=400, detail="File harus berformat Excel")

    # Membaca file Excel
    contents = await file.read()
    try:
        # Memastikan file dapat dibaca sebagai workbook Excel
        workbook = load_workbook(filename=BytesIO(contents))
        sheet = workbook.active

        # Ambil data dari sheet sebagai contoh (bisa disesuaikan dengan kebutuhan)
        data = list(sheet.iter_rows(values_only=True))  # Mengambil data dari sheet
        return {"message": "File berhasil di-upload dan diproses", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat memproses file: {str(e)}")

# Route untuk download-dcc
@app.get("/download-dcc/{dcc_id}")
async def download_dcc(dcc_id: int):
    try:
        # Path ke file Word
        word_file_path = f"./dcc_files/{dcc_id}_output.docx"

        if not os.path.exists(word_file_path):
            raise HTTPException(status_code=404, detail="File not found")

        return FileResponse(path=word_file_path, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename=f"DCC-{dcc_id}.docx")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading DCC: {str(e)}")
