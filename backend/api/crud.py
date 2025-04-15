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
from pikepdf import Pdf, AttachedFileSpec

# Set log level
logging.basicConfig(level=logging.DEBUG)

input_tables = {
    "Resistansi DC": {
        "Arus Uji Nominal": 1, 
        "Resistansi Terukur": 1, 
        "Ketidakpastian": 1
    },
    "Resistansi AC": {
        "Arus Uji Nominal": 2, 
        "Resistansi Terukur": 1, 
        "Ketidakpastian": 1
    },
}

#path
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

#template word
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

# Memproses data Excel dan mengembalikan hasil terstruktur untuk XML
def process_excel_data(excel_path, sheet_name, input_tables):
    
    logging.info(f"Memproses data Excel dari {excel_path}, sheet: {sheet_name}")
    
    table_data = {}
    pythoncom.CoInitialize() 
    
    try:
        excel = win32.Dispatch("Excel.Application")
        excel.Visible = False
        wb = excel.Workbooks.Open(excel_path)
        ws = wb.Sheets(sheet_name)

        max_columns = ws.UsedRange.Columns.Count
        max_rows = ws.UsedRange.Rows.Count

        # Deteksi tabel dalam worksheet
        tables = []
        in_table = False
        first_row, last_row = None, None

        # Deteksi batas baris tiap tabel
        for row in range(1, max_rows + 1):
            filled_cells = [ws.Cells(row, col).Value for col in range(1, max_columns + 1)]
            filled_cells = [cell for cell in filled_cells if cell not in [None, ""]]

            if len(filled_cells) > 2:
                if not in_table:
                    first_row = row
                    in_table = True
                last_row = row
            else:
                if in_table:
                    tables.append((first_row, last_row))
                    in_table = False

        if in_table:
            tables.append((first_row, last_row))

        # nama-nama tabel dari input
        table_names = list(input_tables.keys())

         # ambil data dari setiap tabel
        for idx, (first_row, last_row) in enumerate(tables):
            if idx >= len(table_names):
                continue  
                
            first_col, last_col = None, None

            for col in range(1, max_columns + 1):
                col_has_data = any(ws.Cells(row, col).Value not in [None, ""] for row in range(first_row, last_row + 1))
                if col_has_data:
                    if first_col is None:
                        first_col = col
                    last_col = col

            extracted_data = []

            for col in range(first_col, last_col + 1):
                numbers = []
                units = []
                has_data = False

                for row in range(first_row, last_row + 1):
                    value = ws.Cells(row, col).Value
                    if isinstance(value, (int, float)):
                        numbers.append(str(value))
                        has_data = True

                        unit = ws.Cells(row, col + 1).Value
                        if isinstance(unit, str):
                            units.append(unit)
                        else:
                            units.append("")

                if has_data:
                    extracted_data.append((numbers, units))

            table_name = table_names[idx]
            table_data[table_name] = extracted_data

        return table_data
    
    except Exception as e:
        logging.error(f"Error saat memproses Excel: {str(e)}")
        raise
    finally:
        if 'wb' in locals() and wb:
            wb.Close(False)
        if 'excel' in locals() and excel:
            excel.Quit()
        pythoncom.CoUninitialize()

#XML
def generate_xml(dcc, table_data):
    table_data = some_function_to_get_table_data(dcc)
    for table_name, flat_columns in table_data.items():
        #Generate XML for DCC
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
            with tag("dcc:items"):
                for obj in dcc.objects:
                    with tag("dcc:item"):
                        with tag("dcc:name"): text(obj.jenis)
                        with tag("dcc:manufacturer"): text(obj.merek)
                        with tag("dcc:model"): text(obj.tipe)
                        with tag("dcc:identification"):
                            with tag("dcc:issuer"): text(obj.item_issuer)
                            with tag("dcc:value"): text(obj.seri_item)
                            with tag("dcc:name"):
                                with tag("dcc:content"): text(obj.id_lain)
            with tag('dcc:calibrationLaboratory'): 
                with tag('dcc:calibrationLaboratoryCode'): text('LK-070-IDN')
                with tag('dcc:contact'): 
                    with tag('dcc:name'): 
                        with tag('dcc:content'): text('Laboratorium Standar Nasional Satuan Ukuran, Badan Standarisasi Nasional (SNSU-BSN)')
                    with tag('dcc:eMail'): text('nmi@bsn.go.id')
                    with tag('dcc:phone'): text('Telephone +62-21-7560534, +62-21-7560571, Mobile +62-857-8085-7833')
                    with tag('dcc:link'): text('www.bsn.go.id')
                    with tag('dcc:location'): 
                        with tag('dcc:city'): text('Tangerang Selatan')
                        with tag('dcc:countryCode'): text('ID')
                        with tag('dcc:postCode'): text('15314')
                        with tag('dcc:state'): text('Banten')
                        with tag('dcc:street'): text('KST BJ Habibie Setu')
                        with tag('dcc:streetNo'): text('Gedung 420')
                with tag('dcc:cryptElectronicSignature'): pass
                with tag('dcc:cryptElectronicTimeStamp'): pass
            with tag('dcc:respPersons'): 
                for resp in dcc.responsible_persons:
                    with tag('dcc:respPerson'): 
                        with tag('dcc:person'): 
                            with tag('dcc:name'): 
                                with tag('dcc:content'): text(resp.nama_resp)
                        with tag('dcc:description'): 
                            with tag('dcc:name'): 
                                with tag('dcc:content'): text(resp.nip)
                        with tag('dcc:role'): text(resp.peran)
                        with tag('dcc:mainSigner'): text(resp.main_signer)
                        with tag('dcc:cryptElectronicSignature'): text(resp.signature)
                        with tag('dcc:cryptElectronicTimeStamp'): text(resp.timestamp)
            with tag('dcc:customer'): 
                with tag('dcc:name'): 
                    with tag('dcc:content'): text(dcc.owner.nama_cust)
                with tag('dcc:location'): 
                    with tag('dcc:city'): text(dcc.owner.kota_cust)
                    with tag('dcc:countryCode'): text(dcc.owner.negara_cust)
                    with tag('dcc:postCode'): text(dcc.owner.pos_cust)
                    with tag('dcc:state'): text(dcc.owner.state_cust)
                    with tag('dcc:street'): text(dcc.owner.jalan_cust)
                    with tag('dcc:streetNo'): text(dcc.owner.no_jalan_cust)
             # Statements Section
        with tag('dcc:statement'):
            for stmt in dcc.statements:
                for value in stmt.values:
                    with tag('dcc:name'):
                        with tag('dcc:content'): text(value)

        # Measurement Results Section
        with tag('dcc:measurementResults'):
            # Adding Metode (Methods)
            with tag('dcc:usedMethods'):
                for method in dcc.methods:
                    with tag('dcc:usedMethod'):
                        with tag('dcc:name'):
                            with tag('dcc:content'): text(method.method_name)
                        with tag('dcc:description'):
                            with tag('dcc:content'): text(method.method_desc)
                        with tag('dcc:norm'): text(method.norm)

            # Adding Measuring Equipment (Alat Pengukuran)
            with tag('dcc:measuringEquipments'):
                for equip in dcc.equipments:
                    with tag('dcc:measuringEquipment'):
                        with tag('dcc:name'):
                            with tag('dcc:content'): text(equip.nama_alat)
                        with tag('dcc:identifications'):
                            with tag('dcc:identification'):
                                with tag('dcc:issuer'): text('manufacturer')
                                with tag('dcc:value'): text(equip.seri_measuring)
                                with tag('dcc:name'):
                                    with tag('dcc:content'): text(equip.manuf_model)

            # Adding Room Conditions (Kondisi Ruangan)
            with tag('dcc:influenceConditions'):
                for condition in dcc.conditions:
                    # Kondisi Suhu
                    with tag('dcc:influenceCondition'):
                        with tag('dcc:name'):
                            with tag('dcc:content'): text('Suhu')
                        with tag('dcc:description'):
                            with tag('dcc:content'): text(condition.suhu_desc)
                        with tag('dcc:data'):
                            with tag('dcc:quantity'):
                                with tag('dcc:name'):
                                    with tag('dcc:content'): text('Titik Tengah')
                                with tag('si:real'):
                                    with tag('si:value'): text('')
                                    with tag('si:unit'): text(condition.suhu)
                            with tag('dcc:quantity'):
                                with tag('dcc:name'):
                                    with tag('dcc:content'): text('Rentang')
                                with tag('si:real'):
                                    with tag('si:value'): text(condition.rentang_suhu)
                                    with tag('si:unit'): text(condition.suhu)

                    # Kondisi Lembap
                    with tag('dcc:influenceCondition'):
                        with tag('dcc:name'):
                            with tag('dcc:content'): text('Kelembapan')
                        with tag('dcc:description'):
                            with tag('dcc:content'): text(condition.lembap_desc)
                        with tag('dcc:data'):
                            with tag('dcc:quantity'):
                                with tag('dcc:name'):
                                    with tag('dcc:content'): text('Titik Tengah')
                                with tag('si:real'):
                                    with tag('si:value'): text('') 
                                    with tag('si:unit'): text(condition.lembap)
                            with tag('dcc:quantity'):
                                with tag('dcc:name'):
                                    with tag('dcc:content'): text('Rentang')
                                with tag('si:real'):
                                    with tag('si:value'): text(condition.rentang_lembap)
                                    with tag('si:unit'): text(condition.lembap)
                                    
            # results dari Excel
            with tag('dcc:results'):
                for table_name, flat_columns in table_data.items():
                    column_map = input_tables.get(table_name, {})
                    column_names = list(column_map.keys())
                    subcol_counts = list(column_map.values())

                    flat_index = 0

                    with tag('dcc:result'):
                        with tag('dcc:name'):
                            with tag('dcc:content'):
                                text(table_name)
                        with tag('dcc:data'):
                            with tag('dcc:list'):
                                for col_idx, col_name in enumerate(column_names):
                                    subcol_count = subcol_counts[col_idx]

                                    # Check if this is the last column → Uncertainty
                                    is_uncertainty = (col_idx == len(column_names) - 1)

                                    with tag('dcc:quantity'):
                                        with tag('dcc:name'):
                                            with tag('dcc:content'):
                                                text(col_name)
                                        with tag('si:hybrid'):
                                            for _ in range(subcol_count):
                                                if flat_index >= len(flat_columns):
                                                    break
                                                numbers, units = flat_columns[flat_index]
                                                flat_index += 1

                                                if is_uncertainty:
                                                    with tag('si:realListXMLList'):
                                                        with tag('si:expandedUncXMLList'):
                                                            with tag('si:uncertaintyXMLList'):
                                                                text(" ".join(numbers))
                                                            with tag('si:unitXMLList'):
                                                                text(" ".join(unit if unit else "" for unit in units))
                                                            with tag('si:coverageFactorXMLList'):
                                                                text("2")  # Default value
                                                            with tag('si:coverageProbabilityXMLList'):
                                                                text("0.95")  # Default value
                                                            with tag('si:distributionXMLList'):
                                                                text("normal")  # Default value
                                                else:
                                                    with tag('si:realListXMLList'):
                                                        with tag('si:valueXMLList'):
                                                            text(" ".join(numbers))
                                                        with tag('si:unitXMLList'):
                                                            text(" ".join(unit if unit else "" for unit in units))

                                    
            
        doc.asis('</dcc:digitalCalibrationCertificate>')

        result = indent(doc.getvalue(), indentation='   ')
        return result


def embed_xml_in_pdf(pdf_path, xml_path, output_path):
    pdf = Pdf.open(pdf_path)
    filespec = AttachedFileSpec.from_filepath(pdf, xml_path, mime_type="application/xml")
    pdf.attachments[xml_path.name] = filespec
    pdf.save(output_path)



#db n excel 
def create_dcc(db: Session, dcc: schemas.DCCFormCreate):
    logging.info("Starting DCC creation process")
    
    # Inisialisasi variabel Office
    excel = None
    word = None
    wb = None
    
    try:
        logging.debug("Creating DCC model instance")
        
        conditions_data = []
        for condition in dcc.conditions:  # pastikan baris ini tidak lebih banyak indentasinya
            conditions_data.append({
                "suhu_desc": condition.suhu_desc,
                "suhu": condition.suhu,
                "rentang_suhu": condition.rentang_suhu,
                "lembap_desc": condition.lembap_desc,
                "lembap": condition.lembap,
                "rentang_lembap": condition.rentang_lembap,
            })

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
        new_pdf_path = str(paths['pdf_output'])
        xml_path = str(paths['word_output'].with_suffix('.xml'))

        
        # Buat folder output (jika belum ada)
        os.makedirs(paths['word_output'].parent, exist_ok=True)
        
        # Ambil table_data dari process_excel_data
        table_data = process_excel_data(dcc.excel, dcc.sheet_name, input_tables)
        
        # Generate XML
        xml_content = generate_xml(dcc, table_data)
        with open(xml_path, "w", encoding="utf-8") as f:
            f.write(xml_content)
        logging.info(f"XML file generated at {xml_path}")
        
        
        # Proses template Word
        populate_template(
            dcc.dict(),
            str(paths['template']),
            new_word_path
        )

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
        
        # XML -> PDF/A-3
        embedded_pdf_path = str(paths['pdf_output'].with_name(f"{dcc.sertifikat}_embedded.pdf"))
        embed_xml_in_pdf(str(paths['pdf_output']), xml_path, embedded_pdf_path)
        logging.info(f"Embedded XML into PDF: {embedded_pdf_path}")
        
        return {"download_link": f"http://127.0.0.1:8000/download-dcc/{dcc.sertifikat}_embedded.pdf"}
    
    except Exception as e:
        logging.error(f"Error occurred: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    finally:
        if wb:
            wb.Close(False)
        if excel:
            excel.Quit()
        if word:
            for doc in word.Documents:
                doc.Close(SaveChanges=False)
            word.Quit()

    #except Exception as e:
     #   logging.error(f"Error occurred while saving DCC {dcc.sertifikat}: {e}", exc_info=True)
      #  db.rollback()
       # raise HTTPException(status_code=400, detail=f"Error saving data to database: {str(e)}")