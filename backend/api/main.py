import os
from fastapi import FastAPI
from pydantic import BaseModel
from docx import Document
import xml.etree.ElementTree as ET

app = FastAPI()

# Model data yang akan diterima dari frontend
class DccData(BaseModel):
    labCode: str
    certificate: str
    order: str
    jenis: str
    merek: str
    tipe: str
    seri: str
    issuer: str
    value: str
    namaCust: str
    kotaCust: str
    pejabat: str
    namaPejabat: str
    namaLab: str
    kotaLab: str
    namaAlat: str
    pembuat: str
    model: str
    noSeri: str
    tglMulai: str
    tglAkhir: str
    tempat: str
    jalanCust: str
    noJalanCust: str
    stateCust: str
    kodePosCust: str
    kodeNegaraCust: str
    NIP: str
    tglPengesahan: str
    halaman: str

@app.post("/api/create-new-dcc")
async def create_new_dcc(data: DccData):
    # Membuat direktori jika belum ada
    output_dir = './certificates'
    os.makedirs(output_dir, exist_ok=True)  # Buat direktori jika belum ada

    # Nama file PDF dan XML berdasarkan certificate number
    docx_path = os.path.join(output_dir, f"{data.certificate}.docx")
    xml_path = os.path.join(output_dir, f"{data.certificate}.xml")

    # 1. Mengisi template Word (.docx) dengan data yang diterima
    doc = Document('../assets/template DCC.docx')  # Pastikan path template benar

    # Mengatur context untuk template
    context = {
        'labCode': data.labCode,
        'certificate': data.certificate,
        'order': data.order,
        'jenis': data.jenis,
        'merek': data.merek,
        'seri': data.seri,
        'issuer': data.issuer,
        'value': data.value,
        'namaCust': data.namaCust,
        'jalanCust': data.jalanCust,
        'noJalanCust': data.noJalanCust,
        'kotaCust': data.kotaCust,
        'stateCust': data.stateCust,
        'kodePosCust': data.kodePosCust,
        'kodeNegaraCust': data.kodeNegaraCust,
        'pejabat': data.pejabat,
        'namaPejabat': data.namaPejabat,
        'NIP': data.NIP,
        'tglPengesahan': data.tglPengesahan,
        'halaman': data.halaman,
        'namaAlat': data.namaAlat,
        'pembuat': data.pembuat,
        'model': data.model,
        'noSeri': data.noSeri,
        'tglMulai': data.tglMulai,
        'tglAkhir': data.tglAkhir,
        'tempat': data.tempat
    }

    # Gantilah semua placeholder dalam template .docx dengan context
    for paragraph in doc.paragraphs:
        for key, value in context.items():
            if key in paragraph.text:
                paragraph.text = paragraph.text.replace(f'{{{{ {key} }}}}', value)

    # Simpan file .docx yang telah terisi
    doc.save(docx_path)

    # 2. Membuat file XML
    root = ET.Element("dcc:digitalCalibrationCertificate", xmlns_xsi="http://www.w3.org/2001/XMLSchema-instance", xsi_schemaLocation="https://ptb.de/dcc https://ptb.de/dcc/v3.3.0/dcc.xsd", xmlns_dcc="https://ptb.de/dcc")

    administrativeData = ET.SubElement(root, "dcc:administrativeData")
    coreData = ET.SubElement(administrativeData, "dcc:coreData")
    ET.SubElement(coreData, "dcc:uniqueIdentifier").text = data.certificate
    ET.SubElement(coreData, "dcc:performanceLocation").text = "Lab " + data.namaLab
    ET.SubElement(coreData, "dcc:issueDate").text = "26/07/2024"
    
    # Menambahkan data objek yang dikalibrasi
    items = ET.SubElement(root, "dcc:items")
    item = ET.SubElement(items, "dcc:item")
    ET.SubElement(item, "dcc:name").text = data.namaAlat
    ET.SubElement(item, "dcc:manufacturer").text = data.pembuat
    ET.SubElement(item, "dcc:model").text = data.model
    identification = ET.SubElement(item, "dcc:identification")
    ET.SubElement(identification, "dcc:issuer").text = data.issuer
    ET.SubElement(identification, "dcc:value").text = data.value
    ET.SubElement(identification, "dcc:name").text = data.seri

    # Menyimpan XML ke file
    tree = ET.ElementTree(root)
    tree.write(xml_path)

    return {"message": "Sertifikat berhasil dibuat", "docx_path": docx_path, "xml_path": xml_path}
