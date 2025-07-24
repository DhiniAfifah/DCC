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
from api.schemas import ResponsiblePersons, Pelaksana, Penyelia, KepalaLaboratorium, Direktur
from api.constants import kepala_lab_roles, direktur_roles
import xml.etree.ElementTree as ET
from yattag import Doc, indent
import win32com.client as win32
from docxtpl import DocxTemplate
from spire.pdf.common import *
from spire.pdf import *
from pikepdf import Pdf, AttachedFileSpec
from datetime import datetime
import base64
import tempfile
from fastapi import UploadFile 
from docxtpl import InlineImage
from docx.shared import Mm
from api.ds_i_utils import d_si
import logging
import base64
import tempfile
from fastapi import UploadFile
from api.pdf_generator import PDFGenerator


# Set log level
logging.basicConfig(level=logging.DEBUG)

#path
def get_project_paths(dcc: schemas.DCCFormCreate):
    """Mengambil semua path berdasarkan struktur folder proyek"""
    try:
        backend_root = Path(__file__).parent.parent
        dcc_files_dir = backend_root / "dcc_files"
        dcc_files_dir.mkdir(exist_ok=True)  
        
        # folder assets
        assets_dir = backend_root / "assets"
        if not assets_dir.exists():
            raise FileNotFoundError(f"Folder assets tidak ditemukan di: {assets_dir}")
            
        # template
        template_path = assets_dir / "template DCC.docx"
        if not template_path.exists():
            raise FileNotFoundError(f"Template tidak ditemukan di: {template_path}")
            
            
        excel_path = backend_root / "uploads" / dcc.excel
        if not excel_path.exists():
            # Try the api/uploads path
            excel_path = backend_root / "api" / "uploads" / dcc.excel
            if not excel_path.exists():
                logging.warning(f"Excel file not found at either expected location: {dcc.excel}")
                # Don't raise error here, just log the warning
        
        return {
            'template': template_path,
            'word_output': backend_root / "dcc_files" / f"{dcc.administrative_data.sertifikat}.docx",
            'pdf_output': backend_root / "dcc_files" / f"{dcc.administrative_data.sertifikat}.pdf",
            'xml_output': dcc_files_dir / f"{dcc.administrative_data.sertifikat}.xml", 
            'excel': excel_path
        }
        
    except Exception as e:
        logging.error(f"Error mendapatkan path: {str(e)}")
        raise
    
#BASE 64
def save_image_and_get_base64(upload_file):
    try:
        if not upload_file:
            logging.warning("No upload file provided.")
            return '', ''
        
        if not hasattr(upload_file, 'file'):
            logging.warning(f"Invalid file object type: {type(upload_file)} passed to save_image_and_get_base64")
            return '', ''
        
        # Read the image content as binary
        image_content = upload_file.file.read()  # Read the image file content as binary

        # Encode the image content in base64
        base64_str = base64.b64encode(image_content).decode("utf-8").replace('\n', '')  # Convert binary to base64

        # Create a temporary file path for the image (just in case you want to save it as well)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        temp_file.write(image_content)
        temp_file.close()

        return base64_str, temp_file.name  # Return base64 string and temporary file path
    except Exception as e:
        logging.error(f"Error in save_image_and_get_base64: {str(e)}")
        return '', ''


# Memproses data Excel dan mengembalikan hasil terstruktur untuk XML
def read_excel_tables(excel_path: str, sheet_name: str, results_data: list) -> dict:
    """Membaca tabel dari file Excel dengan struktur sesuai kebutuhan XML"""
    pythoncom.CoInitialize()
    excel = None
    wb = None
    
    try:
        excel = win32.Dispatch("Excel.Application")
        excel.Visible = False
        wb = excel.Workbooks.Open(excel_path)
        
        # Cari sheet yang sesuai (case insensitive)
        sheet_found = None
        for sheet in wb.Sheets:
            if sheet.Name.lower() == sheet_name.lower():
                sheet_found = sheet
                break
        
        if not sheet_found:
            raise FileNotFoundError(f"Sheet '{sheet_name}' tidak ditemukan")
        
        ws = sheet_found
        max_columns = ws.UsedRange.Columns.Count
        max_rows = ws.UsedRange.Rows.Count
        
        # Deteksi tabel: baris dengan >2 sel terisi
        tables = []
        in_table = False
        first_row, last_row = None, None
        
        for row in range(1, max_rows + 1):
            filled_cells = [
                ws.Cells(row, col).Value 
                for col in range(1, max_columns + 1)
            ]
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
        
        table_data = {}
        
        # Proses setiap tabel yang terdeteksi
        for idx, (first_row, last_row) in enumerate(tables):
            if idx >= len(results_data):
                break  # Hanya proses sesuai jumlah results
                
            first_col, last_col = None, None
            # Tentukan rentang kolom
            for col in range(1, max_columns + 1):
                col_has_data = any(
                    ws.Cells(row, col).Value not in [None, ""] 
                    for row in range(first_row, last_row + 1)
                )
                if col_has_data:
                    if first_col is None:
                        first_col = col
                    last_col = col
            
            extracted_data = []
            
            # Ekstrak data per kolom
            for col in range(first_col, last_col + 1):
                numbers = []
                units = []
                has_data = False
                
                for row in range(first_row, last_row + 1):
                    value = ws.Cells(row, col).Value
                    if isinstance(value, (int, float)):
                        numbers.append(str(value))
                        has_data = True
                        # Ambil satuan dari kolom sebelah
                        unit = ws.Cells(row, col + 1).Value
                        unit = unit.replace(".", "") if isinstance(unit, str) else ""
                        units.append(d_si(unit))
                    else:
                        numbers.append("")
                        units.append("")
                
                
                    extracted_data.append((numbers, units))
            
            # Ambil konfigurasi dari results_data
            result_config = results_data[idx]
            param_root = result_config.parameters.root
            table_name = param_root.get('id') or f"Table_{idx+1}"
            
            table_data[table_name] = {
                "data": extracted_data,
                "config": result_config
            }
        
        return table_data
        
    except Exception as e:
        logging.error(f"Error reading Excel: {str(e)}")
        raise
    finally:
        if wb:
            wb.Close(False)
        if excel:
            excel.Quit()
        pythoncom.CoUninitialize()


def clean_text(value):
    """Membersihkan teks dengan menghilangkan spasi di awal/akhir dan mengonversi None ke string kosong"""
    if value is None:
        return ""
    return str(value).strip()

#XML
def generate_xml(dcc, table_data):
        #Generate XML for DCC
        doc, tag, text = Doc().tagtext() 

        doc.asis('<?xml version="1.0" encoding="UTF-8"?>')
        doc.asis('<dcc:digitalCalibrationCertificate xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://ptb.de/dcc https://ptb.de/dcc/v3.3.0/dcc.xsd" xmlns:dcc="https://ptb.de/dcc" xmlns:si="https://ptb.de/si" schemaVersion="3.3.0">')
        
        # Administrative Data section
        with tag('dcc:administrativeData'):
            
            #SOFTWARE 
            with tag('dcc:dccSoftware'): 
                with tag('dcc:software'): 
                    with tag('dcc:name'): 
                        with tag('dcc:content'): text(clean_text(dcc.software))
                    with tag('dcc:release'): text(clean_text(dcc.version))
            
            #DEFINISI REFTYPE        
            with tag('dcc:refTypeDefinitions'):
                with tag('dcc:refTypeDefinition'):
                    with tag('dcc:name'):
                        with tag('dcc:content', lang="de"): text("Namensraum für Querschnitts-RefTypes")
                        with tag('dcc:content', lang="en"): text("Namespace for Cross-Community RefTypes")
                    with tag('dcc:description'):
                        with tag('dcc:content', lang="de"): text("Der Namensraum 'basic' beinhaltet allgemeine RefTypes die messgrößenübergreifend genutzt werden.")
                        with tag('dcc:content', lang="en"): text("The \"basic\" namespace contains RefTypes common for multiple communities.")
                    with tag('dcc:namespace'): text('basic')
                    with tag('dcc:link'): text('https://digilab.ptb.de/dkd/refType/vocab/index.php?tema=2')

                with tag('dcc:refTypeDefinition'):
                    with tag('dcc:name'):
                        with tag('dcc:content', lang="de"): text("Namensraum für mathematische RefTypes")
                        with tag('dcc:content', lang="en"): text("Namespace for mathematical RefTypes")
                    with tag('dcc:description'):
                        with tag('dcc:content', lang="de"): text("Der Namensraum 'math' beinhaltet RefTypes mathematischer Operationen.")
                        with tag('dcc:content', lang="en"): text("The \"math\" namespace contains RefTypes for mathematical operations.")
                    with tag('dcc:namespace'): text('math')
                    with tag('dcc:link'): text('https://digilab.ptb.de/dkd/refType/vocab/index.php?tema=292')
                        
            #CORE DATA        
            with tag('dcc:coreData'): 
                with tag('dcc:countryCodeISO3166_1'): text(dcc.administrative_data.country_code)
                for lang in dcc.administrative_data.used_languages:
                    with tag('dcc:usedLangCodeISO639_1'): text(lang)
                for lang in dcc.administrative_data.mandatory_languages:
                    with tag('dcc:mandatoryLangCodeISO639_1'): text(lang)
                with tag('dcc:uniqueIdentifier'): text(clean_text(dcc.administrative_data.sertifikat))
                with tag('dcc:identifications'):
                    with tag('dcc:identification', refType='basic_orderNumber'):
                        with tag('dcc:issuer'): text(clean_text(dcc.administrative_data.core_issuer))
                        with tag('dcc:value'): text(clean_text(dcc.administrative_data.order))
                        with tag('dcc:name'):
                            with tag('dcc:content'): text('Nomor Order')
                with tag('dcc:beginPerformanceDate'): text(dcc.Measurement_TimeLine.tgl_mulai)
                with tag('dcc:endPerformanceDate'): text(dcc.Measurement_TimeLine.tgl_akhir)
                with tag('dcc:performanceLocation'): text(clean_text(dcc.administrative_data.tempat))
                with tag('dcc:issueDate'): text(dcc.Measurement_TimeLine.tgl_pengesahan)
            
            #ITEMS    
            with tag("dcc:items"):
                for obj in dcc.objects:
                    with tag("dcc:item"):
                        with tag("dcc:name"):
                            for lang in dcc.administrative_data.used_languages:
                                with tag("dcc:content", lang=lang): text(clean_text(obj.jenis.root.get(lang, "")))
                        with tag("dcc:manufacturer"):
                            with tag("dcc:name"):
                                with tag('dcc:content'): text(clean_text(obj.merek))
                        with tag("dcc:model"): text(clean_text(obj.tipe))
                        with tag("dcc:identifications"):
                            with tag("dcc:identification", refType='basic_serialNumber'):
                                with tag("dcc:issuer"): text(clean_text(obj.item_issuer))
                                with tag("dcc:value"): text(clean_text(obj.seri_item))
                                with tag("dcc:name"):
                                    for lang in dcc.administrative_data.used_languages:
                                        with tag("dcc:content", lang=lang): text(clean_text(obj.id_lain.root.get(lang, "")))
            
            #MUTLAK                    
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
                # with tag('dcc:cryptElectronicSignature'): pass
                # with tag('dcc:cryptElectronicTimeStamp'): pass
                
            #RESP_PERSON 
            # Iterasi untuk penyelia
            with tag('dcc:respPersons'): 
                for resp in dcc.responsible_persons.pelaksana:
                    with tag('dcc:respPerson'): 
                        with tag('dcc:person'): 
                            with tag('dcc:name'): 
                                with tag('dcc:content'): text(clean_text(resp.nama_resp))
                        with tag('dcc:description'): 
                            # with tag('dcc:name'): 
                            with tag('dcc:content'): text(clean_text(resp.nip))
                        with tag('dcc:role'): text(clean_text(resp.peran))
                        with tag('dcc:mainSigner'): text(int(resp.main_signer))
                        with tag('dcc:cryptElectronicSignature'): text(int(resp.signature))
                        with tag('dcc:cryptElectronicTimeStamp'): text(int(resp.timestamp))

                # Iterasi untuk penyelia
                for resp in dcc.responsible_persons.penyelia:
                    with tag('dcc:respPerson'): 
                        with tag('dcc:person'): 
                            with tag('dcc:name'): 
                                with tag('dcc:content'): text(resp.nama_resp)
                        with tag('dcc:description'): 
                            # with tag('dcc:name'): 
                            with tag('dcc:content'): text(resp.nip)
                        with tag('dcc:role'): text(resp.peran)
                        with tag('dcc:mainSigner'): text(int(resp.main_signer))
                        with tag('dcc:cryptElectronicSignature'): text(int(resp.signature))
                        with tag('dcc:cryptElectronicTimeStamp'): text(int(resp.timestamp))

                # Iterasi untuk kepala laboratorium
                with tag('dcc:respPerson'): 
                    with tag('dcc:person'): 
                        with tag('dcc:name'): 
                            with tag('dcc:content'): text(dcc.responsible_persons.kepala.nama_resp)
                    with tag('dcc:description'): 
                        # with tag('dcc:name'): 
                        with tag('dcc:content'): text(dcc.responsible_persons.kepala.nip)
                    with tag('dcc:role'): text(dcc.responsible_persons.kepala.peran)
                    with tag('dcc:mainSigner'): text(int(dcc.responsible_persons.kepala.main_signer))
                    with tag('dcc:cryptElectronicSignature'): text(int(dcc.responsible_persons.kepala.signature))
                    with tag('dcc:cryptElectronicTimeStamp'): text(int(dcc.responsible_persons.kepala.timestamp))

                # Iterasi untuk direktur
                with tag('dcc:respPerson'): 
                    with tag('dcc:person'): 
                        with tag('dcc:name'): 
                            with tag('dcc:content'): text(dcc.responsible_persons.direktur.nama_resp)
                    with tag('dcc:description'): 
                        # with tag('dcc:name'): 
                        with tag('dcc:content'): text(dcc.responsible_persons.direktur.nip)
                    with tag('dcc:role'): text(dcc.responsible_persons.direktur.peran)
                    with tag('dcc:mainSigner'): text(int(dcc.responsible_persons.direktur.main_signer))
                    with tag('dcc:cryptElectronicSignature'): text(int(dcc.responsible_persons.direktur.signature))
                    with tag('dcc:cryptElectronicTimeStamp'): text(int(dcc.responsible_persons.direktur.timestamp))
        
            #owner
            with tag('dcc:customer'):
                with tag('dcc:name'):
                    with tag('dcc:content'): 
                        text(clean_text(dcc.owner.nama_cust))
                with tag('dcc:location'):
                    with tag('dcc:city'):
                        text(clean_text(dcc.owner.kota_cust))
                    with tag('dcc:countryCode'):
                        text(clean_text(dcc.owner.negara_cust))
                    with tag('dcc:postCode'):
                        text(clean_text(dcc.owner.pos_cust))
                    with tag('dcc:state'):
                        text(clean_text(dcc.owner.state_cust))
                    with tag('dcc:street'):
                        text(clean_text(dcc.owner.jalan_cust))
                    with tag('dcc:streetNo'):
                        text(clean_text(dcc.owner.no_jalan_cust))                 
                            
            # Statements
            with tag('dcc:statements'):
                for stmt in dcc.statements:
                    
                    ref_type_attr = stmt.refType if hasattr(stmt, 'refType') and stmt.refType else ""
                    with tag('dcc:statement', refType=ref_type_attr):
                        with tag('dcc:declaration'):
                            for lang in dcc.administrative_data.used_languages:
                                with tag('dcc:content', lang=lang): 
                                    text(clean_text(stmt.values.root.get(lang, "") or ""))
                                
                            if stmt.has_formula and stmt.formula:
                                with tag('dcc:formula'):
                                    if stmt.formula.latex:
                                        with tag('dcc:latex'):
                                            text(stmt.formula.latex)
                                    # if stmt.formula.mathml:
                                    #     with tag('dcc:mathml'):
                                    #         text(stmt.formula.mathml)
                            # bagian gambar (jika ada)
                            if stmt.has_image and stmt.image:
                                with tag('dcc:file'):
                                    if getattr(stmt.image, 'fileName', None):
                                        with tag('dcc:fileName'):
                                            text(stmt.image.fileName)
                                    if getattr(stmt.image, 'mimeType', None):
                                        with tag('dcc:mimeType'):
                                            text(stmt.image.mimeType)
                                    if getattr(stmt.image, 'base64', None):
                                        with tag('dcc:dataBase64'):
                                            base64_lines = stmt.image.base64.splitlines()
                                            doc.asis('\n')
                                            indent_spaces = 21
                                            indent_stm = ' ' * indent_spaces
                                            for line in base64_lines:
                                                doc.asis(f"{indent_stm}{line}\n")
                                            doc.asis(' ' * (indent_spaces - 3))

        # MEASUREMENT RESULT 
        with tag('dcc:measurementResults'):
            with tag('dcc:measurementResult'):
                with tag('dcc:name'):
                    with tag('dcc:content'):text('Hasil Kalibrasi / Calibration Results')
                    
                # Metode
                with tag('dcc:usedMethods'):
                    for method in dcc.methods:
                        ref_type = method.refType if method.refType else "basic_calibrationMethod"
                        
                        with tag('dcc:usedMethod', refType=ref_type):
                            with tag('dcc:name'):
                                for lang in dcc.administrative_data.used_languages:
                                    with tag('dcc:content', lang=lang): text(clean_text(method.method_name.root.get(lang, ""))) #Multilang
                            with tag('dcc:description'):
                                for lang in dcc.administrative_data.used_languages:
                                    with tag('dcc:content', lang=lang): text(clean_text(method.method_desc.root.get(lang, ""))) #Multilang
                                if method.has_formula and method.formula:
                                    with tag('dcc:formula'):
                                        with tag('dcc:latex'): text(method.formula.latex or "")
                                        # with tag('dcc:mathml'): text(method.formula.mathml or "")
                                if method.has_image and method.image:
                                    with tag('dcc:file'):
                                        if getattr(method.image, 'fileName', None):
                                            with tag('dcc:fileName'):
                                                text(method.image.fileName)
                                        if getattr(method.image, 'mimeType', None):
                                            with tag('dcc:mimeType'):
                                                text(method.image.mimeType)         
                                        if getattr(method.image, 'base64', None):
                                            with tag('dcc:dataBase64'):
                                                base64_lines = method.image.base64.splitlines()
                                                doc.asis('\n')
                                                indent_spaces = 24
                                                indent_mth = ' ' * indent_spaces
                                                for line in base64_lines:
                                                    doc.asis(f"{indent_mth}{line}\n")
                                                doc.asis(' ' * (indent_spaces - 4)) 
                                                
                            with tag('dcc:norm'): text(clean_text(method.norm))

                # Measuring Equipment 
                with tag('dcc:measuringEquipments'):
                    for equip in dcc.equipments:
                        ref_type = equip.refType if equip.refType else "basic_measurementStandard"
                        with tag('dcc:measuringEquipment', refType=ref_type):
                            with tag('dcc:name'):
                                for lang in dcc.administrative_data.used_languages:
                                    with tag('dcc:content', lang=lang): text(clean_text(equip.nama_alat.root.get(lang, ""))) #Multilang
                            with tag('dcc:manufacturer'):
                                with tag('dcc:name'):
                                    for lang in dcc.administrative_data.used_languages:
                                        with tag('dcc:content', lang=lang): text(clean_text(equip.model.root.get(lang, ""))) #Multilang
                            with tag('dcc:identifications'):
                                with tag('dcc:identification', refType='basic_serialNumber'):
                                    with tag('dcc:issuer'): text('manufacturer')
                                    with tag('dcc:value'): text(clean_text(equip.seri_measuring))
                                    with tag('dcc:name'):
                                         for lang in dcc.administrative_data.used_languages:
                                            with tag('dcc:content', lang=lang): text(clean_text(equip.manuf_model.root.get(lang, ""))) #Multilang

                # Adding Room Conditions 
                with tag('dcc:influenceConditions'):
                    for condition in dcc.conditions:
                        if condition.jenis_kondisi == 'suhu':
                            reftype_value = 'basic_temperature'
                        elif condition.jenis_kondisi == 'lembap':
                            reftype_value = 'basic_humidityRelative'
                        else:
                            reftype_value = None

                        with tag('dcc:influenceCondition', **({'refType': reftype_value} if reftype_value else {})):
                            with tag('dcc:name'):
                                with tag('dcc:content'): text(clean_text(condition.jenis_kondisi))
                            with tag('dcc:description'):
                                for lang in dcc.administrative_data.used_languages:
                                    with tag('dcc:content', lang=lang): text(clean_text(condition.desc.root.get(lang, "") or "")) #Multilang
                                
                            with tag('dcc:data'):
                                # Tengah / nilai minimum
                                with tag('dcc:quantity', refType='math_minimum'):
                                    with tag('dcc:name'):
                                        with tag('dcc:content'): text('nilai minimum') 
                                    with tag('si:real'):
                                        min_value = float(condition.tengah) - float(condition.rentang)
                                        with tag('si:value'): text(f"{min_value}") 
                                        unit_str = ""
                                        if condition.tengah_unit.prefix:
                                            unit_str += condition.tengah_unit.prefix + " "
                                        if condition.tengah_unit.unit:
                                            unit_str += condition.tengah_unit.unit
                                        if condition.tengah_unit.eksponen:
                                            unit_str += f"\\tothe{{{condition.tengah_unit.eksponen}}}"
                                        with tag('si:unit'): text(d_si(unit_str.strip()))

                                # Rentang / nilai maksimum        
                                with tag('dcc:quantity', refType='math_maximum'):
                                    with tag('dcc:name'):
                                        with tag('dcc:content'): text('nilai maksimum') 
                                    with tag('si:real'):
                                        max_value = float(condition.tengah) + float(condition.rentang)
                                        with tag('si:value'): text(f"{max_value}")  
                                        unit_str = ""
                                        if condition.rentang_unit.prefix:
                                            unit_str += condition.rentang_unit.prefix + " "
                                        if condition.rentang_unit.unit:
                                            unit_str += condition.rentang_unit.unit
                                        if condition.rentang_unit.eksponen:
                                            unit_str += f"\\tothe{{{condition.rentang_unit.eksponen}}}"
                                        with tag('si:unit'): text(d_si(unit_str.strip()))

                                        
                # RESULT
                with tag("dcc:results"):
                    for table_name, table_info in table_data.items():
                        flat_columns = table_info["data"]
                        config = table_info["config"]
                        
                        with tag('dcc:result'):
                            # Nama result (multilingual)
                            with tag('dcc:name'):
                                for lang in dcc.administrative_data.used_languages:
                                    with tag('dcc:content', lang=lang):
                                        text(clean_text(config.parameters.root.get(lang, "")))
                            
                            with tag('dcc:data'):
                                with tag('dcc:list'):
                                    flat_index = 0
                                    
                                    for col_config in config.columns:
                                        real_list_count = int(col_config.real_list)
                                        ref_type = col_config.refType or ""
                                        
                                        # Penanganan refType untuk kolom dengan measurement error
                                        if ref_type == "basic_measurementError_error":
                                            ref_type = "basic_measurementError"
                                            is_target = True
                                        elif ref_type == "basic_measurementError_correction":
                                            ref_type = "basic_measurementError"
                                            is_target = True
                                        
                                        with tag('dcc:quantity', refType=ref_type):
                                            # Nama kolom (multilingual)
                                            with tag('dcc:name'):
                                                for lang in dcc.administrative_data.used_languages:
                                                    with tag('dcc:content', lang=lang):
                                                        text(clean_text(col_config.kolom.root.get(lang, "")))
                                            
                                            # Proses sub-kolom
                                            for _ in range(real_list_count):
                                                if flat_index >= len(flat_columns):
                                                    break
                                                numbers, units = flat_columns[flat_index]
                                                flat_index += 1
                                                
                                                with tag('si:realListXMLList'):
                                                    with tag('si:valueXMLList'):
                                                        text(" ".join(numbers).strip())
                                                    with tag('si:unitXMLList'):
                                                        text(" ".join(units).strip())
                                                    
                                                    # Tambahkan uncertainty di dalam blok yang sama
                                                    if ref_type == "basic_measurementError" and flat_index < len(flat_columns):
                                                        uncertainty_numbers, _ = flat_columns[flat_index]
                                                        flat_index += 1
                                                        
                                                        with tag('si:measurementUncertaintyUnivariateXMLList'):
                                                            with tag('si:expandedMUXMLList'):
                                                                with tag('si:valueExpandedMUXMLList'):
                                                                    text(" ".join(uncertainty_numbers).strip())
                                                                with tag('si:coverageFactorXMLList'):
                                                                    text(str(config.uncertainty.factor) if config.uncertainty and config.uncertainty.factor else "")
                                                                with tag('si:coverageProbabilityXMLList'):
                                                                    text(str(config.uncertainty.probability) if config.uncertainty and config.uncertainty.probability else "")
                                                                with tag('si:distributionXMLList'):
                                                                    text(config.uncertainty.distribution if config.uncertainty and config.uncertainty.distribution else "normal")

                                                            
        # COMMENT
        if dcc.comment and dcc.comment.has_file:  
            with tag('dcc:comment'):
                with tag('dcc:name'):
                    with tag('dcc:content'): text(clean_text(dcc.comment.title or ""))
                with tag('dcc:description'):
                    for lang in dcc.administrative_data.used_languages:
                        with tag('dcc:content', lang=lang): text(clean_text(dcc.comment.desc.root.get(lang, "") or ""))
                if dcc.comment.files: 
                    for file in dcc.comment.files:
                        with tag('dcc:file'):
                            if getattr(file, 'fileName', None):
                                with tag('dcc:fileName'):
                                    text(file.fileName)  
                            if getattr(file, 'mimeType', None):
                                with tag('dcc:mimeType'):
                                    text(file.mimeType) 
                            if getattr(file, 'base64', None):
                                with tag('dcc:dataBase64'):
                                    base64_lines = file.base64.splitlines()
                                    doc.asis('\n')
                                    indent_spaces = 12
                                    indent_stm = ' ' * indent_spaces
                                    for line in base64_lines:
                                        doc.asis(f"{indent_stm}{line}\n")
                                    doc.asis(' ' * (indent_spaces - 3))  
                                    
            
        doc.asis('</dcc:digitalCalibrationCertificate>')

        result = indent(doc.getvalue(), indentation='   ')
        return result

#db n excel 
def create_dcc(db: Session, dcc: schemas.DCCFormCreate):
    logging.info("Starting DCC creation process")
    
    # Inisialisasi variabel Office
    excel = None
    word = None
    wb = None
    
    try:
        logging.debug("Creating DCC model instance")
        
        measurement_timeline_data = {
            "tgl_mulai": dcc.Measurement_TimeLine.tgl_mulai,
            "tgl_akhir": dcc.Measurement_TimeLine.tgl_akhir,
            "tgl_pengesahan": dcc.Measurement_TimeLine.tgl_pengesahan
        }

        
        administrative_data_dict = {
            "country_code": dcc.administrative_data.country_code,  # Country of Calibration
            "used_languages": json.dumps(dcc.administrative_data.used_languages),
            "mandatory_languages": json.dumps(dcc.administrative_data.mandatory_languages),
            "order": dcc.administrative_data.order,  # Order Number
            "core_issuer": dcc.administrative_data.core_issuer,  # Core Issuer
            "sertifikat": dcc.administrative_data.sertifikat,  # Certificate Number
            "tempat": dcc.administrative_data.tempat,  # Calibration Place in XML format
            "tempat_pdf": dcc.administrative_data.tempat_pdf,  # Calibration Place in PDF format
        }
        
        # Menyiapkan data kondisi (Suhu, Kelembapan, dan lainnya)
        environmental_conditions = []
        for condition in dcc.conditions:
            environmental_conditions.append({
                "jenis_kondisi": condition.jenis_kondisi,
                "desc": condition.desc.root,
                "tengah": condition.tengah,
                "tengah_unit": condition.tengah_unit.dict() if condition.tengah_unit else None,
                "rentang": condition.rentang,
                "rentang_unit": condition.rentang_unit.dict() if condition.rentang_unit else None,
            })
        
        conditions_data = {
            "environmental_conditions": environmental_conditions
        }
            
        responsible_persons_data = {
            "pelaksana": [p.dict() for p in dcc.responsible_persons.pelaksana],
            "penyelia": [p.dict() for p in dcc.responsible_persons.penyelia],
            "kepala": dcc.responsible_persons.kepala.dict(),
            "direktur": dcc.responsible_persons.direktur.dict()
        }
        
        # Process methods
        methods_data = []
        for method in dcc.methods:
            method_data = {
                "method_name": method.method_name.root,
                "method_desc": method.method_desc.root,
                "norm": method.norm,
                "has_formula": method.has_formula,
                "formula": method.formula.dict() if method.has_formula and method.formula else None,
                "has_image": method.has_image,
                "image": method.image.dict() if method.has_image and method.image else None,
                "refType": method.refType
            }
            methods_data.append(method_data)
            
        #Results    
        results_data = []
        for result in dcc.results:
            result_data = {
                "parameters": result.parameters.root,
                "columns": []
            }
            for col in result.columns:
                col_data = {
                    "kolom": col.kolom.root,
                    "refType": col.refType,
                    "real_list": col.real_list,
                }
                result_data["columns"].append(col_data)
            if result.uncertainty:
                result_data["uncertainty"] = {
                    "factor": result.uncertainty.factor,
                    "probability": result.uncertainty.probability,
                    "distribution": result.uncertainty.distribution or "normal",
                }
            
            results_data.append(result_data)
            
        comment_data = json.dumps(dcc.comment.dict()) if dcc.comment else None
        
        objects_description = []
        for obj in dcc.objects:
            objects_description.append({
                "jenis": obj.jenis.root,
                "merek": obj.merek,
                "tipe": obj.tipe,
                "item_issuer": obj.item_issuer,
                "seri_item": obj.seri_item,
                "id_lain": obj.id_lain.root,
            })
            
        owner_data = {
            "nama_cust": dcc.owner.nama_cust,
            "jalan_cust": dcc.owner.jalan_cust,
            "no_jalan_cust": dcc.owner.no_jalan_cust,
            "kota_cust": dcc.owner.kota_cust,
            "state_cust": dcc.owner.state_cust,
            "pos_cust": dcc.owner.pos_cust,
            "negara_cust": dcc.owner.negara_cust
        }

        equipments_data = []
        for eq in dcc.equipments:
            equipments_data.append({
                "nama_alat": eq.nama_alat.root,
                "manuf_model": eq.manuf_model.root,
                "model": eq.model.dict(),
                "seri_measuring": eq.seri_measuring,
                "refType": eq.refType
            })
 
        statements_data = []
        for stmt in dcc.statements:
            statements_data.append({
                "values": stmt.values.root,  
                "refType": stmt.refType,
                "has_formula": stmt.has_formula,
                "formula": stmt.formula.dict() if stmt.has_formula and stmt.formula else None,
                "has_image": stmt.has_image,
                "image": stmt.image.dict() if stmt.has_image and stmt.image else None
            })          

        # Membuat instansi model DCC dan menyimpan data ke database
        logging.debug(f"Responsible Persons Data: {responsible_persons_data}")
        
        db_dcc = models.DCC(
            software_name=dcc.software,
            software_version=dcc.version,
            administrative_data=administrative_data_dict,
            Measurement_TimeLine=measurement_timeline_data,
            objects_description=objects_description,
            responsible_persons=responsible_persons_data,
            owner=owner_data,
            methods=methods_data,
            equipments=equipments_data,
            conditions=json.dumps(conditions_data), 
            excel=dcc.excel,
            sheet_name=dcc.sheet_name,
            statement=json.dumps(statements_data),
            comment=comment_data,
            results=json.dumps(results_data),
        )

        #logging.info(f"Saving DCC: {dcc.sertifikat} to the database")
        logging.info(f"Saving DCC: {dcc.administrative_data.sertifikat} to the database")
        
        db.add(db_dcc)
        db.commit()
        db.refresh(db_dcc)
        logging.info(f"DCC {dcc.administrative_data.sertifikat} saved successfully with ID {db_dcc.id}")
        
        
        # semua path
        paths = get_project_paths(dcc)
        new_word_path = str(paths['word_output'])
        new_pdf_path = str(paths['pdf_output'])
        xml_path = str(paths['word_output'].with_suffix('.xml'))
        
        # Dapatkan path file Excel
        excel_file_path = paths['excel']
        
        logging.info(f"Excel path full: {excel_file_path}")
        logging.info(f"Excel file exists: {os.path.exists(excel_file_path)}")

        # Buat folder output (jika belum ada)
        os.makedirs(paths['word_output'].parent, exist_ok=True)
        
        # Gunakan excel_file_path yang sudah didapatkan
        table_data = read_excel_tables(str(excel_file_path), dcc.sheet_name, dcc.results)
        
        # Generate XML
        xml_content = generate_xml(dcc, table_data)
        with open(xml_path, "w", encoding="utf-8") as f:
            f.write(xml_content)
        logging.info(f"XML file generated at {xml_path}")
        
         # Generate PDF
        pdf_generator = PDFGenerator()
        pdf_path = str(paths['pdf_output'])
        # Baca konten XML untuk di-embed
        with open(xml_path, "r", encoding="utf-8") as f:
            xml_content = f.read()
        success = pdf_generator.generate_pdf_with_embedded_xml(
            xml_content,
            pdf_path,
            xml_path
        )
        
        if not success:
            raise Exception("PDF generation failed")
        
        return {
            "pdf_path": pdf_path,
            "certificate_name": dcc.administrative_data.sertifikat
        }
        
    finally:
        if wb:
            wb.Close(False)
        if excel:
            excel.Quit()
        if word:
            for doc in word.Documents:
                doc.Close(SaveChanges=False)
            word.Quit()
            