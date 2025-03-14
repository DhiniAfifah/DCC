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
            excel = dcc.excel,
            sheet_name=dcc.sheet_name,
            statements=json.dumps([stmt.dict() for stmt in dcc.statements]),
        )

        logging.info(f"Saving DCC: {dcc.sertifikat} to the database")
        db.add(db_dcc)
        db.commit()
        db.refresh(db_dcc)
        logging.info(f"DCC {dcc.sertifikat} saved successfully with ID {db_dcc.id}")

        excel_path = './uploads/' + dcc.excel
        sheet_name = dcc.sheet_name
        word_path = './assets/template DCC.docx'
        new_word_path = f'./dcc_files/word_{str(db_dcc.id)}.docx'

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