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
import win32com.client as win32

# Set log level
logging.basicConfig(level=logging.DEBUG)

def create_dcc(db: Session, dcc: schemas.DCCFormCreate):
    logging.info("Starting DCC creation process")

    # try:
    #     db_dcc = models.DCC(
    #         software_name=dcc.software,
    #         software_version=dcc.version,
    #         core_issuer=dcc.core_issuer,
    #         country_code=dcc.country_code,
    #         used_languages=json.dumps([lang.value for lang in dcc.used_languages]),
    #         mandatory_languages=json.dumps([lang.value for lang in dcc.mandatory_languages]),
    #         sertifikat_number=dcc.sertifikat,
    #         order_number=dcc.order,
    #         tgl_mulai=datetime.strptime(dcc.tgl_mulai, "%Y-%m-%d").date(),
    #         tgl_akhir=datetime.strptime(dcc.tgl_akhir, "%Y-%m-%d").date(),
    #         tgl_pengesahan=datetime.strptime(dcc.tgl_pengesahan, "%Y-%m-%d").date(),
    #         tempat_kalibrasi=dcc.tempat,
    #         objects_description=json.dumps([obj.dict() for obj in dcc.objects]),
    #         responsible_persons=json.dumps([resp.dict() for resp in dcc.responsible_persons]),
    #         owner=json.dumps(dcc.owner.dict()),
    #         statements=json.dumps(dcc.statements),
    #         methods=json.dumps([method.dict() for method in dcc.methods]),  # Adding Metode
    #         equipments=json.dumps([equip.dict() for equip in dcc.equipments]),  # Adding Alat Pengukuran
    #         conditions=json.dumps([cond.dict() for cond in dcc.conditions])  # Adding Kondisi Ruangan
    #     )

    #     logging.info(f"Saving DCC: {dcc.sertifikat} to the database")
    #     db.add(db_dcc)
    #     db.commit()
    #     db.refresh(db_dcc)
    #     logging.info(f"DCC {dcc.sertifikat} saved successfully with ID {db_dcc.id}")

    #     # Path to generate XML file
    #     xml_file_path = f"./dcc_files/{db_dcc.id}_sertifikat.xml"

    #     doc, tag, text = Doc().tagtext() 

    #     doc.asis('<?xml version="1.0" encoding="UTF-8"?>') 
    #     doc.asis('<dcc:digitalCalibrationCertificate xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://ptb.de/dcc https://ptb.de/dcc/v3.3.0/dcc.xsd" xmlns:dcc="https://ptb.de/dcc" xmlns:si="https://ptb.de/si" schemaVersion="3.3.0">') 
    #     with tag('dcc:administrativeData'): 
    #         with tag('dcc:dccSoftware'): 
    #             with tag('dcc:software'): 
    #                 with tag('dcc:name'): 
    #                     with tag('dcc:content'): text(dcc.software)
    #                 with tag('dcc:release'): text(dcc.version)
    #         with tag('dcc:coreData'): 
    #             with tag('dcc:countryCodeISO3166_1'): text(dcc.country_code)
    #             for lang in dcc.used_languages:
    #                 with tag('dcc:usedLangCodeISO639_1'): text(lang.value)
    #             for lang in dcc.mandatory_languages:
    #                 with tag('dcc:mandatoryLangCodeISO639_1'): text(lang.value)
    #             with tag('dcc:uniqueIdentifier'): text(dcc.sertifikat)
    #             with tag('dcc:identifications'):
    #                 with tag('dcc:identification'):
    #                     with tag('dcc:issuer'): text(dcc.core_issuer)
    #                     with tag('dcc:value'): text(dcc.order)
    #                     with tag('dcc:name'):
    #                         with tag('dcc:content'): text('Nomor Order')
    #             with tag('dcc:beginPerformanceDate'): text(dcc.tgl_mulai)
    #             with tag('dcc:endPerformanceDate'): text(dcc.tgl_akhir)
    #             with tag('dcc:performanceLocation'): text(dcc.tempat)
    #             with tag('dcc:issueDate'): text(dcc.tgl_pengesahan)
    #         with tag("dcc:items"):
    #             for obj in dcc.objects:
    #                 with tag("dcc:item"):
    #                     with tag("dcc:name"): text(obj.jenis)
    #                     with tag("dcc:manufacturer"): text(obj.merek)
    #                     with tag("dcc:model"): text(obj.tipe)
    #                     with tag("dcc:identification"):
    #                         with tag("dcc:issuer"): text(obj.item_issuer)
    #                         with tag("dcc:value"): text(obj.seri_item)
    #                         with tag("dcc:name"):
    #                             with tag("dcc:content"): text(obj.id_lain)
    #         with tag('dcc:calibrationLaboratory'): 
    #             with tag('dcc:calibrationLaboratoryCode'): text('LK-070-IDN')
    #             with tag('dcc:contact'): 
    #                 with tag('dcc:name'): 
    #                     with tag('dcc:content'): text('Laboratorium Standar Nasional Satuan Ukuran, Badan Standarisasi Nasional (SNSU-BSN)')
    #                 with tag('dcc:eMail'): text('nmi@bsn.go.id')
    #                 with tag('dcc:phone'): text('Telephone +62-21-7560534, +62-21-7560571, Mobile +62-857-8085-7833')
    #                 with tag('dcc:link'): text('www.bsn.go.id')
    #                 with tag('dcc:location'): 
    #                     with tag('dcc:city'): text('Tangerang Selatan')
    #                     with tag('dcc:countryCode'): text('ID')
    #                     with tag('dcc:postCode'): text('15314')
    #                     with tag('dcc:state'): text('Banten')
    #                     with tag('dcc:street'): text('KST BJ Habibie Setu')
    #                     with tag('dcc:streetNo'): text('Gedung 420')
    #             with tag('dcc:cryptElectronicSignature'): pass
    #             with tag('dcc:cryptElectronicTimeStamp'): pass
    #         with tag('dcc:respPersons'): 
    #             for resp in dcc.responsible_persons:
    #                 with tag('dcc:respPerson'): 
    #                     with tag('dcc:person'): 
    #                         with tag('dcc:name'): 
    #                             with tag('dcc:content'): text(resp.nama_resp)
    #                     with tag('dcc:description'): 
    #                         with tag('dcc:name'): 
    #                             with tag('dcc:content'): text(resp.nip)
    #                     with tag('dcc:role'): text(resp.peran)
    #                     with tag('dcc:mainSigner'): text(resp.main_signer)
    #                     with tag('dcc:cryptElectronicSignature'): text(resp.signature)
    #                     with tag('dcc:cryptElectronicTimeStamp'): text(resp.timestamp)
    #         with tag('dcc:customer'): 
    #             with tag('dcc:name'): 
    #                 with tag('dcc:content'): text(dcc.owner.nama_cust)
    #             with tag('dcc:location'): 
    #                 with tag('dcc:city'): text(dcc.owner.kota_cust)
    #                 with tag('dcc:countryCode'): text(dcc.owner.negara_cust)
    #                 with tag('dcc:postCode'): text(dcc.owner.pos_cust)
    #                 with tag('dcc:state'): text(dcc.owner.state_cust)
    #                 with tag('dcc:street'): text(dcc.owner.jalan_cust)
    #                 with tag('dcc:streetNo'): text(dcc.owner.no_jalan_cust)
    #          # Statements Section
    #     with tag('dcc:statement'):
    #         for stmt in dcc.statements:
    #             with tag('dcc:name'):
    #                 with tag('dcc:content'): text(stmt)

    #     # Measurement Results Section
    #     with tag('dcc:measurementResults'):
    #         # Adding Metode (Methods)
    #         with tag('dcc:usedMethods'):
    #             for method in dcc.methods:
    #                 with tag('dcc:usedMethod'):
    #                     with tag('dcc:name'):
    #                         with tag('dcc:content'): text(method.method_name)
    #                     with tag('dcc:description'):
    #                         with tag('dcc:content'): text(method.method_desc)
    #                     with tag('dcc:norm'): text(method.norm)

    #         # Adding Measuring Equipment (Alat Pengukuran)
    #         with tag('dcc:measuringEquipments'):
    #             for equip in dcc.equipments:
    #                 with tag('dcc:measuringEquipment'):
    #                     with tag('dcc:name'):
    #                         with tag('dcc:content'): text(equip.nama_alat)
    #                     with tag('dcc:identifications'):
    #                         with tag('dcc:identification'):
    #                             with tag('dcc:issuer'): text('manufacturer')
    #                             with tag('dcc:value'): text(equip.seri_measuring)
    #                             with tag('dcc:name'):
    #                                 with tag('dcc:content'): text(equip.manuf_model)

    #         # Adding Room Conditions (Kondisi Ruangan)
    #         with tag('dcc:influenceConditions'):
    #             for condition in dcc.conditions:
    #                 with tag('dcc:influenceCondition'):
    #                     with tag('dcc:name'):
    #                         with tag('dcc:content'): text(condition.kondisi)
    #                     with tag('dcc:description'):
    #                         with tag('dcc:content'): text(condition.kondisi_desc)
    #                     with tag('dcc:data'):
    #                         with tag('dcc:quantity'):
    #                             with tag('dcc:name'):
    #                                 with tag('dcc:content'): text('Titik Tengah')
    #                             with tag('si:real'):
    #                                 with tag('si:value'): text(condition.tengah_value)
    #                                 with tag('si:unit'): text(condition.tengah_unit)
    #                         with tag('dcc:quantity'):
    #                             with tag('dcc:name'):
    #                                 with tag('dcc:content'): text('Rentang')
    #                             with tag('si:real'):
    #                                 with tag('si:value'): text(condition.rentang_value)
    #                                 with tag('si:unit'): text(condition.rentang_unit)
    #     doc.asis('</dcc:digitalCalibrationCertificate>')

    #     result = indent( 
    #         doc.getvalue(), 
    #         indentation='   '
    #     ) 
        
    #     with open(xml_file_path, "w") as f: 
    #         f.write(result)

    #     # Generating the download link
    #     download_link = f"http://127.0.0.1:8000/download-dcc/{db_dcc.id}.xml"
    #     logging.info(f"Generated download link: {download_link}")

    #     return {"download_link": download_link}

    # except Exception as e:
    #     logging.error(f"Error occurred while saving DCC {dcc.sertifikat}: {e}")
    #     db.rollback()
    #     raise HTTPException(status_code=400, detail=f"Error saving data to database: {str(e)}")
    
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
            methods=json.dumps([method.dict() for method in dcc.methods]),  # Adding Metode
            equipments=json.dumps([equip.dict() for equip in dcc.equipments]),  # Adding Alat Pengukuran
            conditions=json.dumps([cond.dict() for cond in dcc.conditions]),  # Adding Kondisi Ruangan
            excel = dcc.excel[0].name if dcc.excel and len(dcc.excel) > 0 else None,
            sheet_name=dcc.sheet_name,
            statements=json.dumps(dcc.statements),
        )

        logging.info(f"Saving DCC: {dcc.sertifikat} to the database")
        db.add(db_dcc)
        db.commit()
        db.refresh(db_dcc)
        logging.info(f"DCC {dcc.sertifikat} saved successfully with ID {db_dcc.id}")

        excel_path = './uploads/' + dcc.excel[0].name
        sheet_name = dcc.sheet_name
        word_path = './assets/template DCC.docx'
        new_word_path = './dcc_files/word_' + db_dcc.id + '.docx'

        excel = win32.Dispatch("Excel.Application")
        word = win32.Dispatch("Word.Application")
        excel.Visible = False
        word.Visible = True

        wb = excel.Workbooks.Open(excel_path)
        ws = wb.Sheets(sheet_name)

        first_row, last_row = None, None
        first_col, last_col = None, None
        max_columns = ws.UsedRange.Columns.Count

        for row in range(1, ws.UsedRange.Rows.Count + 1):
            filled_cells = [ws.Cells(row, col).Value for col in range(1, max_columns + 1)]
            filled_cells = [cell for cell in filled_cells if cell not in [None, ""]]
            
            if len(filled_cells) > 2:
                if first_row is None:
                    first_row = row - 1
                last_row = row

        if first_row is not None and last_row is not None:
            for col in range(1, max_columns + 1):
                col_has_data = any(ws.Cells(row, col).Value not in [None, ""] for row in range(first_row, last_row + 1))
                if col_has_data:
                    if first_col is None:
                        first_col = col
                    last_col = col
            
            if first_row and first_col and last_row and last_col:
                start_cell = ws.Cells(first_row, first_col).Address.replace("$", "")
                end_cell = ws.Cells(last_row, last_col).Address.replace("$", "")
                print(f"Detected table range: {start_cell}:{end_cell}")
                
                table_range = f"{start_cell}:{end_cell}"
                ws.Range(table_range).Copy()
                
                doc = word.Documents.Open(word_path)
                find_text = "{{ tabel }}"
                find = word.Selection.Find
                find.Text = find_text
                find.Execute()
                
                if find.Found:
                    print("Placeholder found. Inserting table...")
                    word.Selection.Paste()
                else:
                    print("Placeholder '{{ tabel }}' not found in the document.")
                
                doc.SaveAs(new_word_path)
                doc.Close()
                print(f"Tabel berhasil disalin ke {new_word_path}")

        word.Quit()
        wb.Close(False)
        excel.Close(True)
        excel.Quit()
        
    except Exception as e:
        logging.error(f"Error occurred while saving DCC {dcc.sertifikat}: {e}")
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error saving data to database: {str(e)}")