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

# Set log level
logging.basicConfig(level=logging.DEBUG)

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
        base64_str = base64.b64encode(image_content).decode("utf-8")  # Convert binary to base64

        # Create a temporary file path for the image (just in case you want to save it as well)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        temp_file.write(image_content)
        temp_file.close()

        return base64_str, temp_file.name  # Return base64 string and temporary file path
    except Exception as e:
        logging.error(f"Error in save_image_and_get_base64: {str(e)}")
        return '', ''


#template word
def populate_template(dcc_data, word_path, new_word_path):
    doc = DocxTemplate(word_path)
    logging.debug(f"DCC data: {dcc_data}")
    
    def sanitize_for_template(obj):
        if callable(obj):
            # If it's a method or function, return an empty string
            return ""
        elif isinstance(obj, dict):
            # If it's a dictionary, sanitize each value
            return {k: sanitize_for_template(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            # If it's a list, sanitize each item
            return [sanitize_for_template(item) for item in obj]
        elif isinstance(obj, (str, int, float, bool)) or obj is None:
            # Basic types are safe to pass as-is
            return obj
        else:
            # For any other type, convert to string representation
            try:
                return str(obj)
            except:
                return ""
    
    #conditions 
    conditions = dcc_data.get('conditions', [])

    suhu_cond = None
    lembap_cond = None
    other_cond = None

    if conditions:
        first_condition = conditions[0]
        jenis_kondisi = first_condition.get('jenis_kondisi', '')
        desc = first_condition.get('desc', '')
        tengah = first_condition.get('tengah', '')
        rentang = first_condition.get('rentang', '')
        tengah_unit = first_condition.get('tengah_unit', '')
        rentang_unit = first_condition.get('rentang_unit', '')
    else:
        jenis_kondisi = desc = tengah = rentang = tengah_unit = rentang_unit = ''
            
    #statement
    statements_count = len(dcc_data.get('statements', []))
    statements_text = []
    statements_has_formula = []
    statements_formula_latex = []
    statements_formula_mathml = []
    statements_has_image = []
    statements_image_caption = []
    statements_image_path = []
    
    for stmt in dcc_data.get('statements', []):
        # Process values (statement text)
        values = stmt.get('values', [])
        if callable(values):
            values = []
        elif isinstance(values, str):
            values = [values]
        elif not isinstance(values, list):
            try:
                values = list(values) if hasattr(values, '__iter__') else [str(values)]
            except:
                values = []
        
        # Join values into a single string with newlines
        statements_text.append("\n".join(values))
        
        # Process formula
        statements_has_formula.append(stmt.get('has_formula', False))
        statements_formula_latex.append(stmt.get('formula', {}).get('latex', ''))
        statements_formula_mathml.append(stmt.get('formula', {}).get('mathml', ''))
        
        # Process image
        statements_has_image.append(stmt.get('has_image', False))
        statements_image_caption.append(stmt.get('image', {}).get('caption', ''))
        statements_image_path.append(stmt.get('image', {}).get('gambar_url', ''))
    
    # For methods
    methods_count = len(dcc_data.get('methods', []))
    methods_name = []
    methods_desc = []
    methods_has_formula = []
    methods_formula_latex = []
    methods_formula_mathml = []
    methods_norm = []
    methods_has_image = []
    methods_image_caption = []
    methods_image_path = []
    
    for method in dcc_data.get('methods', []):
        methods_name.append(method.get('method_name', ''))
        methods_desc.append(method.get('method_desc', ''))
        methods_has_formula.append(method.get('has_formula', False))
        methods_formula_latex.append(method.get('formula', {}).get('latex', ''))
        methods_formula_mathml.append(method.get('formula', {}).get('mathml', ''))
        methods_norm.append(method.get('norm', ''))
        methods_has_image.append(method.get('has_image', False))
        methods_image_caption.append(method.get('image', {}).get('caption', ''))
        methods_image_path.append(method.get('image', {}).get('gambar_url', ''))

    context = {
        #ADMINISTRATIVE
        'certificate': dcc_data['administrative_data']['sertifikat'],
        'order': dcc_data['administrative_data']['order'],
        'tempat': dcc_data['administrative_data']['tempat_pdf'],
        
        #OBJECTS
        'jenis': dcc_data['objects'][0]['jenis'],
        'merek': dcc_data['objects'][0]['merek'],
        'tipe': dcc_data['objects'][0]['tipe'],
        'item_issuer': dcc_data['objects'][0]['item_issuer'],
        'seri_item': dcc_data['objects'][0]['seri_item'],
        'id_lain': dcc_data['objects'][0]['id_lain'],
        
        #OWNER
        'nama_cust': dcc_data['owner']['nama_cust'],
        'jalan_cust': dcc_data['owner']['jalan_cust'],
        'no_jalan_cust': dcc_data['owner']['no_jalan_cust'],
        'kota_cust': dcc_data['owner']['kota_cust'],
        'state_cust': dcc_data['owner']['state_cust'],
        'pos_cust': dcc_data['owner']['pos_cust'],
        'negara_cust': dcc_data['owner']['negara_cust'],
        
        #RESPONSIBLE PERSON
        'peran_direktur': dcc_data['responsible_persons']['direktur']['peran'],
        'peran_kepala': dcc_data['responsible_persons']['kepala']['peran'],
        'peran_pelaksana': dcc_data['responsible_persons']['pelaksana'][0]['peran'],
        'peran_penyelia': dcc_data['responsible_persons']['penyelia'][0]['peran'],

        'nama_resp_direktur': dcc_data['responsible_persons']['direktur']['nama_resp'],
        'nama_resp_kepala': dcc_data['responsible_persons']['kepala']['nama_resp'],
        'nama_resp_pelaksana': dcc_data['responsible_persons']['pelaksana'][0]['nama_resp'],
        'nama_resp_penyelia': dcc_data['responsible_persons']['penyelia'][0]['nama_resp'],
        
        'nip_resp_direktur': dcc_data['responsible_persons']['direktur']['nip'],
        'nip_resp_kepala': dcc_data['responsible_persons']['kepala']['nip'],
        'nip_resp_pelaksana': dcc_data['responsible_persons']['pelaksana'][0]['nip'],
        'nip_resp_penyelia': dcc_data['responsible_persons']['penyelia'][0]['nip'],
             
        #MEASUREMENT TIMELINE
        'tgl_mulai': dcc_data['Measurement_TimeLine']['tgl_mulai'],
        'tgl_akhir': dcc_data['Measurement_TimeLine']['tgl_akhir'],
        'tgl_pengesahan': dcc_data['Measurement_TimeLine']['tgl_pengesahan'],

        #CONDITIONS
        'jenis_kondisi': jenis_kondisi,
        'desc': desc,
        'tengah': tengah,
        'rentang': rentang,
        'tengah_unit': tengah_unit,
        'rentang_unit': rentang_unit,
        
        #STATEMENT
        'statements_count': statements_count,
        'statements_text': statements_text,
        'statements_has_formula': statements_has_formula,
        'statements_formula_latex': statements_formula_latex,
        'statements_formula_mathml': statements_formula_mathml,
        'statements_has_image': statements_has_image,
        'statements_image_caption': statements_image_caption,
        'statements_image_path': statements_image_path,
        
        #METHODS
        'methods_count': methods_count,
        'methods_name': methods_name,
        'methods_desc': methods_desc,
        'methods_has_formula': methods_has_formula,
        'methods_formula_latex': methods_formula_latex,
        'methods_formula_mathml': methods_formula_mathml,
        'methods_norm': methods_norm,
        'methods_has_image': methods_has_image,
        'methods_image_caption': methods_image_caption,
        'methods_image_path': methods_image_path,
        
        #EXCEL TABEL
        'tabel': "{{ tabel }}",
    }

    safe_context = sanitize_for_template(context)

    try:
        doc.render(safe_context)
        doc.save(new_word_path)
        logging.info(f"Saving modified template to {new_word_path}")
    except Exception as e:
        logging.error(f"Error rendering template: {e}")
        
        # Log detailed information about the context
        try:
            for key, value in context.items():
                if key in ['statements', 'methods']:
                    if isinstance(value, list):
                        for i, item in enumerate(value[:2]):  # Log just first two items to avoid huge logs
                            logging.debug(f"Context details - {key}[{i}]: {item}")
                            # If this is a dict, also log the values inside
                            if isinstance(item, dict):
                                for sub_key, sub_value in item.items():
                                    logging.debug(f"  {key}[{i}][{sub_key}]: {type(sub_value)}")
                                    if isinstance(sub_value, dict) or callable(sub_value):
                                        logging.debug(f"    {key}[{i}][{sub_key}] is {type(sub_value)}")
                else:
                    logging.debug(f"Context key: {key}, type: {type(value)}")
        except Exception as logging_error:
            logging.error(f"Error during debug logging: {logging_error}")
        
        raise

    #hapus file gambar sementara setelah generate word
    for method in dcc_data.get('methods', []):
        tmp_path = method.get('image', {}).get('tmp_path', None)
        if tmp_path and isinstance(tmp_path, str) and os.path.exists(tmp_path):
            os.remove(tmp_path)

    return new_word_path


# Memproses data tabel dari Excel dan input pengguna
def some_function_to_get_table_data(dcc):
    logging.info(f"Processing table data for DCC: {dcc.sertifikat}")
    
    # Dictionary to store the processed table data
    table_data = {}
    
    # Get paths
    paths = get_project_paths(dcc)
    excel_path = str(paths['excel'])
    
    # Initialize result tables based on user input from frontend
    input_tables = {}
    
    # Process the result fields from the form
    for result in dcc.results:
        # Get the parameter name (table name)
        parameter_name = result.parameter
        
        # Create mapping of column names to number of sub-columns
        column_mapping = {}
        
        # Add all regular columns
        for column in result.columns:
            # Get the column name and number of sub-columns
            column_name = column.kolom
            # Convert number of sub-columns to integer if it's a string
            num_subcols = int(column.real_list) if isinstance(column.real_list, str) else len(column.real_list)
            column_mapping[column_name] = num_subcols
            
        # Add uncertainty column (always present)
        if hasattr(result, 'uncertainty'):
            uncertainty_column = "Uncertainty"
            column_mapping[uncertainty_column] = 1
        
        # Add table to input tables
        input_tables[parameter_name] = column_mapping
    
    # Process the Excel data using the helper function
    if hasattr(dcc, 'sheet_name') and dcc.sheet_name:
        try:
            processed_data = process_excel_data(excel_path, dcc.sheet_name, input_tables)
            table_data.update(processed_data)
            logging.info(f"Successfully processed {len(processed_data)} tables from Excel")
        except Exception as e:
            logging.error(f"Error processing Excel data: {str(e)}")
            raise
    
    # Add uncertainty data from user input (not from Excel)
    for result in dcc.results:
        parameter_name = result.parameter
        
        if parameter_name in table_data and hasattr(result, 'uncertainty'):
            # Create uncertainty data structure
            uncertainty_data = []
            
            # If uncertainty value is provided
            if hasattr(result.uncertainty, 'real_list') and result.uncertainty.real_list:
                # Process values and units
                values = result.uncertainty.real_list.split() if isinstance(result.uncertainty.real_list, str) else [str(val) for val in result.uncertainty.real_list]
                units = [""] * len(values)  # Default empty units
                
                uncertainty_data.append((values, units))
                
                # Add the uncertainty data to the table
                table_data[parameter_name].append(uncertainty_data)
    
    logging.info(f"Completed table data processing, returning {len(table_data)} tables")
    return table_data


# Mempersiapkan struktur tabel dari data formulir pengguna
def prepare_input_tables(dcc):
    input_tables = {}
    
    # Proses setiap hasil dari formulir
    for result in dcc.results:
        parameter_name = result.parameters[0] if isinstance(result.parameters, list) else result.parameters
        column_mapping = {}
        
        # Proses kolom biasa
        for column in result.columns:
            column_name = column.kolom
            try:
                # Periksa jika real_list adalah integer atau string/list
                if isinstance(column.real_list, int):
                    num_subcols = column.real_list
                elif isinstance(column.real_list, str):
                    num_subcols = int(column.real_list)
                elif hasattr(column.real_list, "__len__"):
                    num_subcols = len(column.real_list)
                else:
                    num_subcols = 1  # Default jika tidak ada value yang valid
                    
                logging.debug(f"Determined num_subcols: {num_subcols}")
            except Exception as e:
                logging.error(f"Error processing column {column.kolom}: {e}")
                num_subcols = 1  # Default jika terjadi error
                
            column_mapping[column_name] = num_subcols
        
        # Tambahkan kolom ketidakpastian jika ada
        if hasattr(result, 'uncertainty') and result.uncertainty:
            uncertainty_column = "Uncertainty"
            column_mapping[uncertainty_column] = 1
        
        input_tables[parameter_name] = column_mapping
    
    return input_tables


# Memproses data Excel dan mengembalikan hasil terstruktur untuk XML
def process_excel_data(excel_filename, sheet_name, input_tables):
    logging.info(f"Processing Excel data from {excel_filename}, sheet: {sheet_name}")
    table_data = {}
    pythoncom.CoInitialize()

    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        uploads_dir = os.path.join(current_dir, 'uploads')
        excel_path = os.path.join(uploads_dir, excel_filename)
        excel_path = os.path.abspath(excel_path)  # Pastikan path absolut
        
        logging.info(f"Membuka file Excel: {excel_path}")
        if not os.path.exists(excel_path):
            logging.error(f"File Excel tidak ditemukan: {excel_path}")
            raise FileNotFoundError(f"File Excel tidak ditemukan: {excel_path}")
        
        # pembukaan file Excel menggunakan win32
        excel = win32.Dispatch("Excel.Application")
        excel.Visible = False
        logging.debug("Excel instance created")
        
        try:
            wb = excel.Workbooks.Open(excel_path)
        except Exception as e:
            logging.error(f"Error opening Excel file: {e}")
            raise Exception(f"Failed to open Excel file: {e}")

        # Normalisasi nama sheet
        sheet_names = [sheet.Name.strip().replace(" ", "").lower() for sheet in wb.Sheets]
        normalized_sheet_name = sheet_name.strip().replace(" ", "").lower()
        
        logging.info(f"Normalized requested sheet name: {normalized_sheet_name}")
        
        if normalized_sheet_name not in sheet_names:
            logging.error(f"Sheet '{sheet_name}' not found in the Excel file")
            raise ValueError(f"Sheet '{sheet_name}' not found in the Excel file")

        # Mengakses sheet yang valid
        ws = wb.Sheets(sheet_name)

        max_columns = ws.UsedRange.Columns.Count
        max_rows = ws.UsedRange.Rows.Count

        tables = []
        in_table = False
        first_row, last_row = None, None

        # Detecting rows and columns in the table
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

        # Extracting table data
        table_names = list(input_tables.keys())

        for idx, (first_row, last_row) in enumerate(tables):
            table_name = table_names[idx] if idx < len(table_names) else f"Table {idx + 1}"
            column_map = input_tables.get(table_name, {})
            column_names = list(column_map.keys())
            subcol_counts = list(column_map.values())

            extracted_data = []

            for col in range(1, max_columns + 1):
                numbers = []
                units = []
                for row in range(first_row, last_row + 1):
                    value = ws.Cells(row, col).Value
                    if isinstance(value, (int, float)):
                        numbers.append(str(value))
                        unit = ws.Cells(row, col + 1).Value
                        if isinstance(unit, str):
                            converted_unit = d_si(unit) #DS-I
                            units.append(converted_unit)
                        else:
                            units.append(None)

                if numbers:
                    extracted_data.append((numbers, units))

            table_data[table_name] = extracted_data

        wb.Close(False)
        excel.Quit()

        return table_data

    except FileNotFoundError as e:
        logging.error(f"File not found error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        logging.error(f"Value error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error processing Excel file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        # Pastikan untuk membersihkan COM objects dan menutup Excel
        try:
            if 'wb' in locals() and wb:
                wb.Close(False)
            if 'excel' in locals() and excel:
                excel.Quit()
        except Exception as e:
            logging.error(f"Error during cleanup: {str(e)}")

        pythoncom.CoUninitialize()



#XML
def generate_xml(dcc, table_data):
        #Generate XML for DCC
        doc, tag, text = Doc().tagtext() 

        doc.asis('<?xml version="1.0" encoding="UTF-8"?>')
        doc.asis('<dcc:digitalCalibrationCertificate xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://ptb.de/dcc https://ptb.de/dcc/v3.3.0/dcc.xsd" xmlns:dcc="https://ptb.de/dcc" xmlns:si="https://ptb.de/si" schemaVersion="3.3.0">')
        
        # Administrative Data section
        with tag('dcc:administrativeData'): 
            with tag('dcc:dccSoftware'): 
                with tag('dcc:software'): 
                    with tag('dcc:name'): 
                        with tag('dcc:content'): text(dcc.software)
                    with tag('dcc:release'): text(dcc.version)
            with tag('dcc:coreData'): 
                with tag('dcc:countryCodeISO3166_1'): text(dcc.administrative_data.country_code)
                for lang in dcc.administrative_data.used_languages:
                    with tag('dcc:usedLangCodeISO639_1'): text(lang)
                for lang in dcc.administrative_data.mandatory_languages:
                    with tag('dcc:mandatoryLangCodeISO639_1'): text(lang)
                with tag('dcc:uniqueIdentifier'): text(dcc.administrative_data.sertifikat)
                with tag('dcc:identifications'):
                    with tag('dcc:identification'):
                        with tag('dcc:issuer'): text(dcc.administrative_data.core_issuer)
                        with tag('dcc:value'): text(dcc.administrative_data.order)
                        with tag('dcc:name'):
                            with tag('dcc:content'): text('Nomor Order')
                with tag('dcc:beginPerformanceDate'): text(dcc.Measurement_TimeLine.tgl_mulai)
                with tag('dcc:endPerformanceDate'): text(dcc.Measurement_TimeLine.tgl_akhir)
                with tag('dcc:performanceLocation'): text(dcc.administrative_data.tempat)
                with tag('dcc:approvalDate'): text(dcc.Measurement_TimeLine.tgl_pengesahan)
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
                for resp in dcc.responsible_persons.pelaksana:
                    with tag('dcc:respPerson'): 
                        with tag('dcc:person'): 
                            with tag('dcc:name'): 
                                with tag('dcc:content'): text(resp.nama_resp)
                        with tag('dcc:description'): 
                            with tag('dcc:name'): 
                                with tag('dcc:content'): text(resp.nip)
                        with tag('dcc:role'): text(resp.peran)
                        with tag('dcc:mainSigner'): text(str(resp.main_signer))
                        with tag('dcc:cryptElectronicSignature'): text(str(resp.signature))
                        with tag('dcc:cryptElectronicTimeStamp'): text(str(resp.timestamp))

                # Iterasi untuk penyelia
                for resp in dcc.responsible_persons.penyelia:
                    with tag('dcc:respPerson'): 
                        with tag('dcc:person'): 
                            with tag('dcc:name'): 
                                with tag('dcc:content'): text(resp.nama_resp)
                        with tag('dcc:description'): 
                            with tag('dcc:name'): 
                                with tag('dcc:content'): text(resp.nip)
                        with tag('dcc:role'): text(resp.peran)
                        with tag('dcc:mainSigner'): text(str(resp.main_signer))
                        with tag('dcc:cryptElectronicSignature'): text(str(resp.signature))
                        with tag('dcc:cryptElectronicTimeStamp'): text(str(resp.timestamp))

                # Iterasi untuk kepala laboratorium
                with tag('dcc:respPerson'): 
                    with tag('dcc:person'): 
                        with tag('dcc:name'): 
                            with tag('dcc:content'): text(dcc.responsible_persons.kepala.nama_resp)
                    with tag('dcc:description'): 
                        with tag('dcc:name'): 
                            with tag('dcc:content'): text(dcc.responsible_persons.kepala.nip)
                    with tag('dcc:role'): text(dcc.responsible_persons.kepala.peran)
                    with tag('dcc:mainSigner'): text(str(dcc.responsible_persons.kepala.main_signer))
                    with tag('dcc:cryptElectronicSignature'): text(str(dcc.responsible_persons.kepala.signature))
                    with tag('dcc:cryptElectronicTimeStamp'): text(str(dcc.responsible_persons.kepala.timestamp))

                # Iterasi untuk direktur
                with tag('dcc:respPerson'): 
                    with tag('dcc:person'): 
                        with tag('dcc:name'): 
                            with tag('dcc:content'): text(dcc.responsible_persons.direktur.nama_resp)
                    with tag('dcc:description'): 
                        with tag('dcc:name'): 
                            with tag('dcc:content'): text(dcc.responsible_persons.direktur.nip)
                    with tag('dcc:role'): text(dcc.responsible_persons.direktur.peran)
                    with tag('dcc:mainSigner'): text(str(dcc.responsible_persons.direktur.main_signer))
                    with tag('dcc:cryptElectronicSignature'): text(str(dcc.responsible_persons.direktur.signature))
                    with tag('dcc:cryptElectronicTimeStamp'): text(str(dcc.responsible_persons.direktur.timestamp))
        
        #owner
        with tag('dcc:customer'):
            with tag('dcc:name'):
                with tag('dcc:content'):
                    text(dcc.owner.nama_cust)
            with tag('dcc:location'):
                with tag('dcc:city'):
                    text(dcc.owner.kota_cust)
                with tag('dcc:countryCode'):
                    text(dcc.owner.negara_cust)
                with tag('dcc:postCode'):
                    text(dcc.owner.pos_cust)
                with tag('dcc:state'):
                    text(dcc.owner.state_cust)
                with tag('dcc:street'):
                    text(dcc.owner.jalan_cust)
                with tag('dcc:streetNo'):
                    text(dcc.owner.no_jalan_cust)                 
                        
        # Statements
        with tag('dcc:statements'):
            for stmt in dcc.statements:
                with tag('dcc:statement'):
                    with tag('dcc:declaration'):
                        content_text = " ".join(stmt.values) if stmt.values else ""
                        with tag('dcc:content'):
                            text(content_text)
                        if stmt.has_formula and stmt.formula:
                            with tag('dcc:formular'):
                                if stmt.formula.latex:
                                    with tag('dcc:latex'):
                                        text(stmt.formula.latex)
                                if stmt.formula.mathml:
                                    with tag('dcc:mathml'):
                                        text(stmt.formula.mathml)
                        # bagian gambar (jika ada)
                        if stmt.has_image and stmt.image:
                            with tag('dcc:image'):
                                if getattr(stmt.image, 'caption', None):
                                    with tag('dcc:caption'):
                                        text(stmt.image.caption)
                                if getattr(stmt.image, 'base64', None):
                                    with tag('dcc:base64'):
                                        text(stmt.image.base64)

        # Measurement Results Section
        with tag('dcc:measurementResults'):
            # Metode
            with tag('dcc:usedMethods'):
                for method in dcc.methods:
                    with tag('dcc:usedMethod'):
                        with tag('dcc:name'):
                            with tag('dcc:content'): text(method.method_name)
                        with tag('dcc:description'):
                            with tag('dcc:content'): text(method.method_desc)
                            if method.has_formula and method.formula:
                                with tag('dcc:formular'):
                                    with tag('dcc:latex'): text(method.formula.latex or "")
                                    with tag('dcc:mathml'): text(method.formula.mathml or "")
                            if method.has_image and method.image:
                                with tag('dcc:image'):
                                    if getattr(method.image, 'caption', None):
                                        with tag('dcc:caption'):
                                            text(method.image.caption)
                                    if getattr(method.image, 'base64', None):
                                        with tag('dcc:base64'):
                                            text(method.image.base64)
                        with tag('dcc:norm'): text(method.norm)

            # Measuring Equipment 
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

            # Adding Room Conditions 
            with tag('dcc:influenceConditions'):
                for condition in dcc.conditions:
                    with tag('dcc:influenceCondition'):
                        with tag('dcc:name'):
                            with tag('dcc:content'): text(condition.jenis_kondisi)
                            
                        with tag('dcc:description'):
                            with tag('dcc:content'): text(condition.desc)
                            
                        with tag('dcc:data'):
                            with tag('dcc:quantity'):
                                with tag('dcc:name'):
                                    with tag('dcc:content'): text('Titik Tengah') #nilai min
                                with tag('si:real'):
                                    with tag('si:value'): text(condition.tengah) #66-6
                                    with tag('si:unit'): text(condition.tengah_unit)
                                    
                            with tag('dcc:quantity'):
                                with tag('dcc:name'):
                                    with tag('dcc:content'): text('Rentang') # nilai max
                                with tag('si:real'):
                                    with tag('si:value'): text(condition.rentang) #66+6
                                    with tag('si:unit'): text(condition.tengah_unit)
                                    
            # Results from Excel and user input
            with tag('dcc:results'):
                # Prepare the input_tables dictionary from dcc.results
                input_tables = prepare_input_tables(dcc)
                
                for result_idx, result in enumerate(dcc.results):
                    if isinstance(result.parameters, list) and len(result.parameters) > 0:
                        parameter_name = result.parameters[0] 
                    else:
                        parameter_name = result.parameters  
                    
                    if parameter_name not in table_data:
                        logging.warning(f"Table '{parameter_name}' not found in Excel data") 
                        continue
                    
                flat_columns = table_data[parameter_name]
                column_map = input_tables.get(parameter_name, {})
                column_names = list(column_map.keys())
                subcol_counts = list(column_map.values())

                with tag('dcc:result'):
                    with tag('dcc:name'):
                        with tag('dcc:content'):
                            text(parameter_name)
                    with tag('dcc:data'):
                        with tag('dcc:list'):
                            flat_index = 0
                            
                            for col_idx, col_name in enumerate(column_names):
                                subcol_count = subcol_counts[col_idx]
                                
                                # Check if this is the uncertainty column
                                is_uncertainty = (col_name == "Uncertainty")
                                
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
                                            
                                            if is_uncertainty and hasattr(result, 'uncertainty'):
                                                # Use uncertainty data from user input
                                                with tag('si:realListXMLList'):
                                                    with tag('si:expandedUncXMLList'):
                                                        with tag('si:uncertaintyXMLList'):
                                                            text(" ".join(numbers))
                                                        with tag('si:unitXMLList'):
                                                            text(" ".join(d_si(unit) if unit else "" for unit in units))
                                                        with tag('si:coverageFactorXMLList'):
                                                            text(result.uncertainty.factor or "2")
                                                        with tag('si:coverageProbabilityXMLList'):
                                                            text(result.uncertainty.probability or "0.95")
                                                        with tag('si:distributionXMLList'):
                                                            text(result.uncertainty.distribution or "normal")
                                            else:
                                                # Regular column data from Excel
                                                with tag('si:realListXMLList'):
                                                    with tag('si:valueXMLList'):
                                                        text(" ".join(numbers))
                                                    with tag('si:unitXMLList'):
                                                        text(" ".join(d_si(unit) if unit else "" for unit in units))

                                    
            
        doc.asis('</dcc:digitalCalibrationCertificate>')

        result = indent(doc.getvalue(), indentation='   ')
        return result

#
def embed_xml_in_pdf(pdf_path, xml_path, output_path):
    pdf = Pdf.open(pdf_path)
    filespec = AttachedFileSpec.from_filepath(pdf, xml_path, mime_type="application/xml")
    pdf.attachments[xml_path.name] = filespec
    pdf.save(output_path)

# def parse_date(date_str):
    # try:
        # Adjusting to handle ISO 8601 format (with time and timezone)
        # Replace 'Z' with '+00:00' to make it a valid format for fromisoformat
        #date_str = date_str.replace("Z", "+00:00")
        #return datetime.fromisoformat(date_str)  # Converts ISO 8601 to datetime
    #except ValueError:
        #raise HTTPException(status_code=400, detail=f"Invalid date format: {date_str}")

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
                "desc": condition.desc,
                "tengah": condition.tengah,
                "tengah_unit": condition.tengah_unit,
                "rentang": condition.rentang,
                "rentang_unit": condition.rentang_unit,
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
                "method_name": method.method_name,
                "method_desc": method.method_desc,
                "norm": method.norm,
                "has_formula": method.has_formula,
                "formula": method.formula.dict() if method.has_formula and method.formula else None,
                "has_image": method.has_image,
                "image": method.image.dict() if method.has_image and method.image else None
            }
            methods_data.append(method_data)
        
        # Process the results
        results_data = []
        for result in dcc.results:
            if not isinstance(result.parameters, list) or not all(isinstance(param, str) for param in result.parameters):
                raise HTTPException(status_code=422, detail="All 'parameters' must be an array of strings.")
            result_data = {
                "parameters": result.parameters,
                "columns": [
                    {
                        "kolom": col.kolom,
                        "real_list": col.real_list
                    }
                    for col in result.columns
                ],
                "uncertainty": {
                    "factor": result.uncertainty.factor,
                    "probability": result.uncertainty.probability,
                    "distribution": result.uncertainty.distribution or "",
                    "real_list": result.uncertainty.real_list
                }
            }
            results_data.append(result_data)

        # Membuat instansi model DCC dan menyimpan data ke database
        logging.debug(f"Responsible Persons Data: {responsible_persons_data}")
        
        db_dcc = models.DCC(
            software_name=dcc.software,
            software_version=dcc.version,
            administrative_data=administrative_data_dict,
            Measurement_TimeLine=measurement_timeline_data,
            objects_description=json.dumps([obj.dict() for obj in dcc.objects]),
            responsible_persons=json.dumps(responsible_persons_data),
            owner=json.dumps(dcc.owner.dict()),
            methods=json.dumps(methods_data),
            equipments=json.dumps([equip.dict() for equip in dcc.equipments]),
            conditions=json.dumps(conditions_data), 
            excel=dcc.excel,
            sheet_name=dcc.sheet_name,
            statement=json.dumps([stmt.dict() for stmt in dcc.statements]),
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
        
        logging.info(f"Excel path full: {paths['excel']}")
        logging.info(f"Excel file exists: {os.path.exists(paths['excel'])}")

        
        # Buat folder output (jika belum ada)
        os.makedirs(paths['word_output'].parent, exist_ok=True)
        
        # Ambil table_data dari process_excel_data
        # Menggunakan fungsi prepare_input_tables untuk mendapatkan input_tables
        input_tables = prepare_input_tables(dcc) 
        
        # Ambil data tabel dengan menggunakan process_excel_data
        table_data = process_excel_data(str(paths['excel']), dcc.sheet_name, input_tables)
        
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

        # Proses Excel (masuk ke word)
        try:
            logging.debug("Initializing Excel COM object")
            excel = win32.Dispatch("Excel.Application")
            excel.Visible = False
            
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
            
            
            
     # Konversi ke PDF
        #convert(new_word_path)

        #pdf_path = fr"C:\Users\a516e\Documents\GitHub\DCC\backend\dcc_files\{dcc.sertifikat}.pdf"

        #converter = PdfStandardsConverter(pdf_path)
        #converter.ToPdfA3A(pdf_path)
        #logging.info(f"Converted {new_word_path} to PDFA/3-A")
        #return {"download_link": download_link}

    #except Exception as e:
     #   logging.error(f"Error occurred while saving DCC {dcc.sertifikat}: {e}", exc_info=True)
      #  db.rollback()
       # raise HTTPException(status_code=400, detail=f"Error saving data to database: {str(e)}")