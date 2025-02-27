import logging
import json
from fastapi import HTTPException
import api.models as models
import api.schemas as schemas
from sqlalchemy.orm import Session
from datetime import datetime
from fpdf import FPDF 
import os
from docx import Document
from docx2pdf import convert

# Set log level
logging.basicConfig(level=logging.DEBUG)

def create_dcc(db: Session, dcc: schemas.DCCFormCreate):
    logging.info("Starting DCC creation process")

    try:
        db_dcc = models.DCC(
            software_name=dcc.software,
            software_version=dcc.version,
            core_issuer=dcc.core_issuer,
            country_code=dcc.country_code,
            used_languages=json.dumps([lang.value for lang in dcc.used_languages]),
            mandatory_languages=json.dumps([lang.value for lang in dcc.mandatory_languages]),
            sertifikat_number=dcc.sertifikat,
            order_number=dcc.order,
            tgl_mulai=datetime.strptime(dcc.tgl_mulai, "%Y-%m-%d").date(),
            tgl_akhir=datetime.strptime(dcc.tgl_akhir, "%Y-%m-%d").date(),
            tgl_pengesahan=datetime.strptime(dcc.tgl_pengesahan, "%Y-%m-%d").date(),
            tempat_kalibrasi=dcc.tempat,
            objects_description=json.dumps([obj.dict() for obj in dcc.objects]),
            responsible_person=json.dumps([resp.dict() for resp in dcc.responsible_person]),
            owner_identity=json.dumps(dcc.owner_identity.dict()),
            statements=json.dumps(dcc.statements)
        )

        logging.info(f"Saving DCC: {dcc.sertifikat} to the database")
        db.add(db_dcc)
        db.commit()
        db.refresh(db_dcc)
        logging.info(f"DCC {dcc.sertifikat} saved successfully with ID {db_dcc.id}")

        # Path to template file
        template_path = "./assets/sertifikat_template.docx"
        
        # Load the template
        doc = Document(template_path)

        # Replace placeholders with actual data from DCC
        doc.paragraphs[0].text = f"DCC Sertifikat: {dcc.sertifikat}"  # Example, you can replace more placeholders

        # Replace other placeholders with relevant data
        doc.paragraphs[1].text = f"Software: {dcc.software}"
        doc.paragraphs[2].text = f"Version: {dcc.version}"
        doc.paragraphs[3].text = f"Core Issuer: {dcc.core_issuer}"

        # Save the modified file as a temporary .docx file
        modified_doc_path = f"./dcc_files/{db_dcc.id}_modified.docx"
        doc.save(modified_doc_path)

        # Convert the .docx file to PDF
        modified_pdf_path = f"./dcc_files/{db_dcc.id}.pdf"
        convert(modified_doc_path, modified_pdf_path)

        # Delete the temporary .docx file
        os.remove(modified_doc_path)

        # Generate download link
        download_link = f"http://127.0.0.1:8000/download-dcc/{db_dcc.id}"
        logging.info(f"Generated download link: {download_link}")

        return {"download_link": download_link}

    except Exception as e:
        logging.error(f"Error occurred while saving DCC {dcc.sertifikat}: {e}")
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error saving data to database: {str(e)}")