import logging
import json
from fastapi import HTTPException
import models as models
import schemas as schemas
from sqlalchemy.orm import Session
from datetime import datetime
from fpdf import FPDF 
import os
from docx import Document
from docx2pdf import convert
import xml.etree.ElementTree as ET

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
            responsible_persons=json.dumps([resp.dict() for resp in dcc.responsible_persons]),
            owner=json.dumps(dcc.owner.dict()),
            statements=json.dumps(dcc.statements)
        )

        logging.info(f"Saving DCC: {dcc.sertifikat} to the database")
        db.add(db_dcc)
        db.commit()
        db.refresh(db_dcc)
        logging.info(f"DCC {dcc.sertifikat} saved successfully with ID {db_dcc.id}")

        # Path to generate XML file
        xml_file_path = f"../dcc_files/{db_dcc.id}_sertifikat.xml"
        
        # Creating the XML structure
        root = ET.Element("DCC")
        ET.SubElement(root, "software_name").text = dcc.software
        ET.SubElement(root, "software_version").text = dcc.version
        ET.SubElement(root, "core_issuer").text = dcc.core_issuer
        ET.SubElement(root, "sertifikat_number").text = dcc.sertifikat
        ET.SubElement(root, "order_number").text = dcc.order
        ET.SubElement(root, "tgl_mulai").text = dcc.tgl_mulai
        ET.SubElement(root, "tgl_akhir").text = dcc.tgl_akhir
        ET.SubElement(root, "tgl_pengesahan").text = dcc.tgl_pengesahan
        ET.SubElement(root, "tempat_kalibrasi").text = dcc.tempat
        
        # Adding used_languages and mandatory_languages
        used_langs = ET.SubElement(root, "used_languages")
        for lang in dcc.used_languages:
            ET.SubElement(used_langs, "language").text = lang.value
        
        mandatory_langs = ET.SubElement(root, "mandatory_languages")
        for lang in dcc.mandatory_languages:
            ET.SubElement(mandatory_langs, "language").text = lang.value
        
        # Adding other data (objects, responsible responsible_persons, etc.)
        objects = ET.SubElement(root, "objects_description")
        for obj in dcc.objects:
            obj_elem = ET.SubElement(objects, "object")
            for key, value in obj.dict().items():
                ET.SubElement(obj_elem, key).text = str(value)
        
        responsible_personss = ET.SubElement(root, "responsible_persons")
        for resp in dcc.responsible_persons:
            resp_elem = ET.SubElement(responsible_personss, "person")
            for key, value in resp.dict().items():
                ET.SubElement(resp_elem, key).text = str(value)
        
        owner = ET.SubElement(root, "owner")
        for key, value in dcc.owner.dict().items():
            ET.SubElement(owner, key).text = str(value)
        
        # Adding statements
        statements = ET.SubElement(root, "statements")
        for stmt in dcc.statements:
            ET.SubElement(statements, "statement").text = stmt

        # Writing XML to file
        tree = ET.ElementTree(root)
        tree.write(xml_file_path)

        # Generating the download link
        download_link = f"http://127.0.0.1:8000/download-dcc/{db_dcc.id}_sertifikat.xml"
        logging.info(f"Generated download link: {download_link}")

        return {"download_link": download_link}

    except Exception as e:
        logging.error(f"Error occurred while saving DCC {dcc.sertifikat}: {e}")
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error saving data to database: {str(e)}")