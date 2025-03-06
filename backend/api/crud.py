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
import xml.etree.ElementTree as ET
from yattag import Doc, indent

# Set log level
logging.basicConfig(level=logging.DEBUG)

def create_dcc(db: Session, dcc: schemas.DCCFormCreate):
    logging.info(f"Received request with tgl_mulai: {dcc.tgl_mulai}, tgl_akhir: {dcc.tgl_akhir}, tgl_pengesahan: {dcc.tgl_pengesahan}")

    try:
        # Validasi jika tanggal kosong
        if not dcc.tgl_mulai or not dcc.tgl_akhir or not dcc.tgl_pengesahan:
            raise ValueError("Tanggal tidak boleh kosong")

        # Mengonversi tanggal ke format datetime
        tgl_mulai = datetime.strptime(dcc.tgl_mulai, "%Y-%m-%d").date()
        tgl_akhir = datetime.strptime(dcc.tgl_akhir, "%Y-%m-%d").date()
        tgl_pengesahan = datetime.strptime(dcc.tgl_pengesahan, "%Y-%m-%d").date()

        # Menyimpan data DCC ke dalam database
        db_dcc = models.DCC(
            software_name=dcc.software,
            software_version=dcc.version,
            core_issuer=dcc.core_issuer,
            country_code=dcc.country_code,
            used_languages=json.dumps([lang.value for lang in dcc.used_languages]), 
            mandatory_languages=json.dumps([lang.value for lang in dcc.mandatory_languages]),
            sertifikat_number=dcc.sertifikat,
            order_number=dcc.order,
            tgl_mulai=tgl_mulai,
            tgl_akhir=tgl_akhir,
            tgl_pengesahan=tgl_pengesahan,
            tempat_kalibrasi=dcc.tempat,
            objects_description=json.dumps([obj.dict() for obj in dcc.objects]),  
            responsible_persons=json.dumps([resp.dict() for resp in dcc.responsible_persons]),  
            owner=json.dumps(dcc.owner.dict()),  
            statements=json.dumps([stmt.statement for stmt in dcc.statements]),  
            methods=json.dumps([method.dict() for method in dcc.methods]),  
            equipments=json.dumps([equipment.dict() for equipment in dcc.equipments]),  
            conditions=json.dumps([condition.dict() for condition in dcc.conditions]),  
        )

        logging.info(f"Saving DCC: {dcc.sertifikat} to the database")
        db.add(db_dcc)
        db.commit()
        db.refresh(db_dcc)
        logging.info(f"DCC {dcc.sertifikat} saved successfully with ID {db_dcc.id}")

        return {"message": "DCC created successfully!", "dcc_id": db_dcc.id}

    except Exception as e:
        logging.error(f"Error occurred while saving DCC {dcc.sertifikat}: {e}")
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error saving data to database: {str(e)}")
    
    except Exception as e:
        logging.error(f"Unexpected error occurred: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

        # Path to generate XML file
        xml_file_path = f"./dcc_files/{db_dcc.id}_sertifikat.xml"

        doc, tag, text = Doc().tagtext() 

        doc.asis('<?xml version="1.0" encoding="UTF-8"?>') 
        doc.asis('<dcc:digitalCalibrationCertificate xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://ptb.de/dcc https://ptb.de/dcc/v3.3.0/dcc.xsd" xmlns:dcc="https://ptb.de/dcc" xmlns:si="https://ptb.de/si" schemaVersion="3.3.0">') 
        with tag('dcc:administrativeData'): 
            with tag('dcc:dccSoftware'): 
                with tag('dcc:software'): 
                    with tag('dcc:name'): 
                        with tag('dcc:content'): text(dcc.software)
                    with tag('dcc:release'): text(dcc.version)
            with tag('dcc:coreData'): 
                with tag('dcc:countryCodeISO3166_1'): text(dcc.country_code)
                for lang in dcc.used_languages:
                    with tag('dcc:usedLangCodeISO639_1'): text(lang.value)
                for lang in dcc.mandatory_languages:
                    with tag('dcc:mandatoryLangCodeISO639_1'): text(lang.value)
                with tag('dcc:uniqueIdentifier'): text(dcc.sertifikat)
                with tag('dcc:identifications'):
                    with tag('dcc:identification'):
                        with tag('dcc:issuer'): text(dcc.core_issuer)
                        with tag('dcc:value'): text(dcc.order)
                        with tag('dcc:name'):
                            with tag('dcc:content'): text('Nomor Order')
                with tag('dcc:beginPerformanceDate'): text(dcc.tgl_mulai)
                with tag('dcc:endPerformanceDate'): text(dcc.tgl_akhir)
                with tag('dcc:performanceLocation'): text(dcc.tempat)
                with tag('dcc:issueDate'): text(dcc.tgl_pengesahan)

        # Handle methods, equipments, and conditions
        with tag('dcc:measurementResults'):
            for method in dcc.methods:
                with tag('dcc:usedMethods'):
                    with tag('dcc:usedMethod'):
                        with tag('dcc:name'):
                            with tag('dcc:content'): text(method.method_name)
                        with tag('dcc:description'):
                            with tag('dcc:content'): text(method.method_desc)
                        with tag('dcc:norm'): text(method.norm)

            with tag('dcc:measuringEquipments'):
                for equipment in dcc.equipments:
                    with tag('dcc:measuringEquipment'):
                        with tag('dcc:name'):
                            with tag('dcc:content'): text(equipment.nama_alat)
                        with tag('dcc:identifications'):
                            with tag('dcc:identification'):
                                with tag('dcc:issuer'): text(equipment.manuf_model)
                                with tag('dcc:value'): text(equipment.seri_measuring)

            with tag('dcc:influenceConditions'):
                for condition in dcc.conditions:
                    with tag('dcc:influenceCondition'):
                        with tag('dcc:name'):
                            with tag('dcc:content'): text(condition.kondisi)
                        with tag('dcc:description'):
                            with tag('dcc:content'): text(condition.kondisi_desc)
                        
        # with tag('dcc:measurementResults'): 
        #     with tag('dcc:measurementResult'):
        #         with tag('dcc:name'): 
        #             with tag('dcc:content'): text('Hasil Kalibrasi / Calibration Results')
        #         with tag('dcc:usedMethods'): 
        #             with tag('dcc:usedMethod'): 
        #                 with tag('dcc:name'): 
        #                     with tag('dcc:content'): text(method_name1)
        #                 with tag('dcc:description'): 
        #                     with tag('dcc:content'): text(method_desc1)
        #                 with tag('dcc:norm'): text(norm1)
        #         with tag('dcc:measuringEquipments'): 
        #             with tag('dcc:measuringEquipment'): 
        #                 with tag('dcc:name'): 
        #                     with tag('dcc:content'): text(nama_alat1)
        #                 with tag('dcc:identifications'):
        #                     with tag('dcc:identification'):
        #                         with tag('dcc:issuer'): text('manufacturer')
        #                         with tag('dcc:value'): text(seri_measuring1)
        #                         with tag('dcc:name'): 
        #                             with tag('dcc:content'): text(manuf_model1)
        #         with tag('dcc:influenceConditions'): 
        #             with tag('dcc:influenceCondition'): 
        #                 with tag('dcc:name'): 
        #                     with tag('dcc:content'): text('Suhu/Temperature')
        #                 with tag('dcc:description'): 
        #                     with tag('dcc:content'): text(kondisi_desc_suhu)
        #                 with tag('dcc:data'): 
        #                     with tag('dcc:quantity'): 
        #                         with tag('dcc:name'): 
        #                             with tag('dcc:content'): text('Titik Tengah')
        #                         with tag('si:real'): 
        #                             with tag('si:value'): text(suhu)
        #                             with tag('si:unit'): text(tengah_unit_suhu)
        #                     with tag('dcc:quantity'): 
        #                         with tag('dcc:name'): 
        #                             with tag('dcc:content'): text('Rentang')
        #                         with tag('si:real'): 
        #                             with tag('si:value'): text(rentang_suhu)
        #                             with tag('si:unit'): text(rentang_unit_suhu)
        #             with tag('dcc:influenceCondition'): 
        #                 with tag('dcc:name'): 
        #                     with tag('dcc:content'): text('Kelembaban/Humidity')
        #                 with tag('dcc:description'): 
        #                     with tag('dcc:content'): text(kondisi_desc_lembap)
        #                 with tag('dcc:data'): 
        #                     with tag('dcc:quantity'): 
        #                         with tag('dcc:name'): 
        #                             with tag('dcc:content'): text('Titik Tengah')
        #                         with tag('si:real'): 
        #                             with tag('si:value'): text(lembap)
        #                             with tag('si:unit'): text(tengah_unit_lembap)
        #                     with tag('dcc:quantity'): 
        #                         with tag('dcc:name'): 
        #                             with tag('dcc:content'): text('Rentang')
        #                         with tag('si:real'): 
        #                             with tag('si:value'): text(rentang_lembap)
        #                             with tag('si:unit'): text(rentang_unit_lembap)
        #         with tag('dcc:results'): 
        #             with tag('dcc:result'): 
        #                 with tag('dcc:name'): 
        #                     with tag('dcc:content'): text(judul_tabel1)
        #                 with tag('dcc:data'):
        #                     with tag('dcc:list'):
        #                         with tag('dcc:quantity'):
        #                             with tag('dcc:name'):
        #                                 with tag('dcc:content'): text(kolom11)
        #                             with tag('si:hybrid'):
        #                                 with tag('si:realListXMLList'):
        #                                     with tag('si:valueXMLList'): text(value11)
        #                                     with tag('si:unitXMLList'): text(unit11)
        #                         with tag('dcc:quantity'):
        #                             with tag('dcc:name'):
        #                                 with tag('dcc:content'): text(kolom12)
        #                             with tag('si:hybrid'):
        #                                 with tag('si:realListXMLList'):
        #                                     with tag('si:valueXMLList'): text(value12)
        #                                     with tag('si:unitXMLList'): text(unit12)
        #             with tag('dcc:result'): 
        #                 with tag('dcc:name'): 
        #                     with tag('dcc:content'): text(judul_tabel2)
        #                 with tag('dcc:data'):
        #                     with tag('dcc:list'):
        #                         with tag('dcc:quantity'):
        #                             with tag('dcc:name'):
        #                                 with tag('dcc:content'): text(kolom21)
        #                             with tag('si:hybrid'):
        #                                 with tag('si:realListXMLList'):
        #                                     with tag('si:valueXMLList'): text(value21)
        #                                     with tag('si:unitXMLList'): text(unit21)
        #                         with tag('dcc:quantity'):
        #                             with tag('dcc:name'):
        #                                 with tag('dcc:content'): text(kolom22)
        #                             with tag('si:hybrid'):
        #                                 with tag('si:realListXMLList'):
        #                                     with tag('si:valueXMLList'): text(value12)
        #                                     with tag('si:unitXMLList'): text(unit12)
        
        doc.asis('</dcc:digitalCalibrationCertificate>')

        result = indent( 
            doc.getvalue(), 
            indentation='   '
        ) 
        
        with open(xml_file_path, "w") as f: 
            f.write(result)

        # Generating the download link
        download_link = f"http://127.0.0.1:8000/download-dcc/{db_dcc.id}_sertifikat.xml"
        logging.info(f"Generated download link: {download_link}")

        return {"download_link": download_link}

    except Exception as e:
        logging.error(f"Error occurred while saving DCC {dcc.sertifikat}: {e}")
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error saving data to database: {str(e)}")