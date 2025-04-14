import logging
import json
from pathlib import Path
from fastapi import HTTPException
import api.models as models
import api.schemas as schemas
from sqlalchemy.orm import Session
from datetime import datetime
from fpdf import FPDF 
import os
import pythoncom
from docx import Document
from docx2pdf import convert
import xml.etree.ElementTree as ET
from yattag import Doc, indent
import win32com.client as win32
from docxtpl import DocxTemplate
from spire.pdf.common import *
from spire.pdf import *

# Set log level
logging.basicConfig(level=logging.DEBUG)

def get_project_paths(dcc: schemas.DCCFormCreate):
    """Mengambil semua path berdasarkan struktur folder proyek"""
    try:
        backend_root = Path(__file__).parent.parent
        
        # folder assets
        assets_dir = backend_root / "assets"
        if not assets_dir.exists():
            raise FileNotFoundError(f"Folder assets tidak ditemukan di: {assets_dir}")
            
        # template
        template_path = assets_dir / "template DCC.docx"
        if not template_path.exists():
            raise FileNotFoundError(f"Template tidak ditemukan di: {template_path}")
            
        return {
            'template': template_path,
            'word_output': backend_root / "dcc_files" / f"{dcc.sertifikat}.docx",
            'pdf_output': backend_root / "dcc_files" / f"{dcc.sertifikat}.pdf",
            'excel': backend_root / "uploads" / dcc.excel
        }
        
    except Exception as e:
        logging.error(f"Error mendapatkan path: {str(e)}")
        raise


def populate_template(dcc_data, word_path, new_word_path):
    doc = DocxTemplate(word_path)
    logging.debug(f"DCC data: {dcc_data}")

    context = {
        'certificate': dcc_data['sertifikat'],
        'order': dcc_data['order'],
        'jenis': dcc_data['objects'][0]['jenis'],
        'merek': dcc_data['objects'][0]['merek'],
        'tipe': dcc_data['objects'][0]['tipe'],
        'item_issuer': dcc_data['objects'][0]['item_issuer'],
        'seri_item': dcc_data['objects'][0]['seri_item'],
        'id_lain': dcc_data['objects'][0]['id_lain'],
        'nama_cust': dcc_data['owner']['nama_cust'],
        'jalan_cust': dcc_data['owner']['jalan_cust'],
        'no_jalan_cust': dcc_data['owner']['no_jalan_cust'],
        'kota_cust': dcc_data['owner']['kota_cust'],
        'state_cust': dcc_data['owner']['state_cust'],
        'pos_cust': dcc_data['owner']['pos_cust'],
        'negara_cust': dcc_data['owner']['negara_cust'],
        'peran': dcc_data['responsible_persons'][0]['peran'],
        'nama_resp': dcc_data['responsible_persons'][0]['nama_resp'],
        'nip_resp': dcc_data['responsible_persons'][0]['nip'],
        'tgl_pengesahan': dcc_data['tgl_pengesahan'],
        'tgl_mulai': dcc_data['tgl_mulai'],
        'tgl_akhir': dcc_data['tgl_akhir'],
        'tempat': dcc_data['tempat'],
        'suhu': dcc_data['conditions'][0]['suhu'],
        'rentang_suhu': dcc_data['conditions'][0]['rentang_suhu'],
        'lembap': dcc_data['conditions'][0]['lembap'],
        'rentang_lembap': dcc_data['conditions'][0]['rentang_lembap'],
        'statements': dcc_data['statements'][0]['values'][0],
        'tabel': "{{ tabel }}",
    }

    doc.render(context)
    doc.save(new_word_path)
    logging.info(f"Saving modified template to {new_word_path}")

    return new_word_path

def create_dcc(db: Session, dcc: schemas.DCCFormCreate):
    logging.info("Starting DCC creation process")
    
    # Inisialisasi variabel Office
    excel = None
    word = None
    wb = None
    
    try:
        logging.debug("Creating DCC model instance")
        
        # Saat memproses data kondisi
        conditions_data = []
        for condition in dcc.conditions:
            condition_data = {
                'suhu_desc': condition.suhu_desc,
                'suhu': condition.suhu,
                'rentang_suhu': condition.rentang_suhu,
                'lembap_desc': condition.lembap_desc,
                'lembap': condition.lembap,
                'rentang_lembap': condition.rentang_lembap,
            }
            conditions_data.append(condition_data)


        # Membuat instansi model DCC dan menyimpan data ke database
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
            methods=json.dumps([method.dict() for method in dcc.methods]),
            equipments=json.dumps([equip.dict() for equip in dcc.equipments]),
            conditions=json.dumps(conditions_data),  # Memasukkan data kondisi yang sudah diproses
            excel=dcc.excel,
            sheet_name=dcc.sheet_name,
            statements=json.dumps([stmt.dict() for stmt in dcc.statements]),
        )

        logging.info(f"Saving DCC: {dcc.sertifikat} to the database")
        db.add(db_dcc)
        db.commit()
        db.refresh(db_dcc)
        logging.info(f"DCC {dcc.sertifikat} saved successfully with ID {db_dcc.id}")
        
        
        excel = win32.Dispatch("Excel.Application")
        word = win32.Dispatch("Word.Application")
        excel.Visible = False
        word.Visible = False
        
        # semua path
        paths = get_project_paths(dcc)
        new_word_path = str(paths['word_output'])

        
        # Buat folder output jika belum ada
        os.makedirs(paths['word_output'].parent, exist_ok=True)
        
        # Proses template Word
        populate_template(
            dcc.dict(),
            str(paths['template']),
            new_word_path
        )
        
        
        #Path untuk template dan output (Dhini)
        # template_path = r'C:\Users\dhini\Desktop\DCC\backend\assets\template DCC.docx'
        # output_path = fr"C:\Users\dhini\Desktop\DCC\backend\dcc_files\{dcc.sertifikat}_filled.docx"

        # Path untuk template dan output (Rachelle)
        # template_path = r'C:\Users\a516e\Documents\GitHub\DCC\backend\assets\template DCC.docx'
        #new_word_path = fr"C:\Users\a516e\Documents\GitHub\DCC\backend\dcc_files\{dcc.sertifikat}.docx"

        # Mengisi template Word dengan data input manual
        #populated_template = populate_template(dcc.dict(), template_path, new_word_path)

        # Generating the download link
        #download_link = f"http://127.0.0.1:8000/download-dcc/{db_dcc.id}.xml"
        #logging.info(f"Generated download link: {download_link}")

        # # Dhini
        # excel_path = fr'C:\Users\dhini\Desktop\DCC\backend\uploads\{dcc.excel}'
        # sheet_name = dcc.sheet_name

        # Rachelle
        #excel_path = fr'C:\Users\a516e\Documents\GitHub\DCC\backend\uploads\{dcc.excel}'
        #sheet_name = dcc.sheet_name

        #logging.info("Initializing Excel and Word applications")
        #excel = win32.Dispatch("Excel.Application")
        #word = win32.Dispatch("Word.Application")
        #excel.Visible = False
        #word.Visible = True

        # Proses Excel
        try:
            logging.debug("Opening Excel file")
            wb = excel.Workbooks.Open(str(paths['excel']))
            ws = wb.Sheets(dcc.sheet_name)

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

            logging.debug(f"Detected first row: {first_row}, last row: {last_row}")

            if first_row is not None and last_row is not None:
                for col in range(1, max_columns + 1):
                    col_has_data = any(ws.Cells(row, col).Value not in [None, ""] for row in range(first_row, last_row + 1))
                    if col_has_data:
                        if first_col is None:
                            first_col = col
                        last_col = col

                logging.debug(f"Detected first column: {first_col}, last column: {last_col}")
                
            if first_row and first_col and last_row and last_col:
                start_cell = ws.Cells(first_row, first_col).Address.replace("$", "")
                end_cell = ws.Cells(last_row, last_col).Address.replace("$", "")
                logging.info(f"Detected table range: {start_cell}:{end_cell}")
                    
                table_range = f"{start_cell}:{end_cell}"
                ws.Range(table_range).Copy()
                    
                word = win32.Dispatch("Word.Application")
                word.Visible = False
                    
                logging.info("Opening Word template")
                doc = word.Documents.Open(new_word_path)
                find_text = "{{ tabel }}"
                find = word.Selection.Find
                find.Text = find_text
                # find.ClearFormatting()  # Menghapus formatting pencarian yang mungkin mengganggu
                find.MatchCase = False  # Tidak case-sensitive
                find.MatchWholeWord = True  # Pencarian sesuai dengan kata lengkap
                find.Execute()
                    
                if find.Found:
                    logging.info("Placeholder found. Inserting table...")
                    word.Selection.Paste()
                else:
                    logging.warning("Placeholder '{{ tabel }}' not found in the document.")
                    
                    doc.SaveAs(new_word_path)
                    doc.Close()
                    logging.info(f"Table successfully copied to {new_word_path}")

        except Exception as e:
            logging.error(f"Error processing Office files: {str(e)}")
            raise
        finally:
        # Tutup Excel
            if wb:
                wb.Close(False)
            if excel:
                excel.Quit()

        # Konversi ke PDF
        #convert(new_word_path)

        #pdf_path = fr"C:\Users\a516e\Documents\GitHub\DCC\backend\dcc_files\{dcc.sertifikat}.pdf"

        #converter = PdfStandardsConverter(pdf_path)
        #converter.ToPdfA3A(pdf_path)
        #logging.info(f"Converted {new_word_path} to PDFA/3-A")
        #return {"download_link": download_link}

        # Konversi ke PDF
        convert(new_word_path)
        converter = PdfStandardsConverter(str(paths['pdf_output']))
        converter.ToPdfA3A(str(paths['pdf_output']))
        logging.info(f"Converted {new_word_path} to PDFA/3-A")
        
        return {"download_link": f"http://127.0.0.1:8000/download-dcc/{db_dcc.id}.xml"}
    
    except Exception as e:
        logging.error(f"Error occurred: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
        # Pastikan aplikasi ditutup
    if word.Documents.Count > 0:  # Line 296 (TAMBAHKAN TITIK DUA)
        try:                      # Line 297 (INDENTASI)
            for doc in word.Documents:
                doc.Close(SaveChanges=False)
            word.Quit()
        except Exception as e:
            logging.error(f"Error closing Word: {str(e)}")

    #except Exception as e:
     #   logging.error(f"Error occurred while saving DCC {dcc.sertifikat}: {e}", exc_info=True)
      #  db.rollback()
       # raise HTTPException(status_code=400, detail=f"Error saving data to database: {str(e)}")