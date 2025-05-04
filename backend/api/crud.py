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
        'tempat': dcc_data['tempat_pdf'],
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
    
    # Process each result (table) from the form
    for result in dcc.results:
        parameter_name = result.parameter
        column_mapping = {}
        
        # Process regular columns
        for column in result.columns:
            column_name = column.kolom
            num_subcols = int(column.real_list) if isinstance(column.real_list, str) else len(column.real_list)
            column_mapping[column_name] = num_subcols
        
        # Add uncertainty column if present
        if hasattr(result, 'uncertainty') and result.uncertainty:
            uncertainty_column = "Uncertainty"
            column_mapping[uncertainty_column] = 1
        
        input_tables[parameter_name] = column_mapping
    
    return input_tables


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

            if len(filled_cells) > 2: # Assuming a table row has at least 3 cells with data
                if not in_table:
                    first_row = row
                    in_table = True
                last_row = row
            else:
                if in_table:
                    tables.append((first_row, last_row))
                    in_table = False
                    
        # Handle the case where the last table extends to the end of the sheet
        if in_table:
            tables.append((first_row, last_row))

        # Get table names from input_tables
        table_names = list(input_tables.keys())

         # ambil data dari setiap tabel
        for idx, (first_row, last_row) in enumerate(tables):
            if idx >= len(table_names):
                continue  
            
            # Find the column boundaries for this table
            first_col, last_col = None, None
            for col in range(1, max_columns + 1):
                col_has_data = any(ws.Cells(row, col).Value not in [None, ""] for row in range(first_row, last_row + 1))
                if col_has_data:
                    if first_col is None:
                        first_col = col
                    last_col = col

            extracted_data = []
            
            # Get the expected columns from input_tables
            table_name = table_names[idx]
            expected_cols = input_tables[table_name]
            expected_col_names = list(expected_cols.keys())

            # For each data column in the table
            current_col = first_col
            for col_name in expected_col_names:
                if col_name == "Uncertainty":
                    continue  # Skip uncertainty column as it's added manually later
                    
                num_subcols = expected_cols[col_name]
                
                for _ in range(num_subcols):
                    numbers = []
                    units = []
            
                # Extract all values from this column
                for row in range(first_row, last_row + 1):
                    value = ws.Cells(row, col).Value
                    if isinstance(value, (int, float)):
                        numbers.append(str(value))

                        # Try to get unit from adjacent cell
                        unit = ws.Cells(row, current_col + 1).Value
                        if isinstance(unit, str):
                            units.append(unit)
                        else:
                            units.append("")
                                
                                
                # Only add if we found data
                if numbers:
                    extracted_data.append((numbers, units))
                    
                    # Move to next column
                current_col += 2  # Assuming each value+unit takes 2 columns
            
            # Store the extracted data for this table
            table_data[table_name] = extracted_data

        return table_data
    
    except Exception as e:
        logging.error(f"Error processing Excel: {str(e)}")
        raise
    finally:
        if 'wb' in locals() and wb:
            wb.Close(False)
        if 'excel' in locals() and excel:
            excel.Quit()
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
                with tag('dcc:performanceLocation'): text(dcc.tempat_xml)
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
                                    
            # Results from Excel and user input
            with tag('dcc:results'):
                # Prepare the input_tables dictionary from dcc.results
                input_tables = prepare_input_tables(dcc)
                
                for result_idx, result in enumerate(dcc.results):
                    parameter_name = result.parameter
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
                                                            text(" ".join(unit if unit else "" for unit in units))
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
                                                        text(" ".join(unit if unit else "" for unit in units))

                                    
            
        doc.asis('</dcc:digitalCalibrationCertificate>')

        result = indent(doc.getvalue(), indentation='   ')
        return result

#
def embed_xml_in_pdf(pdf_path, xml_path, output_path):
    pdf = Pdf.open(pdf_path)
    filespec = AttachedFileSpec.from_filepath(pdf, xml_path, mime_type="application/xml")
    pdf.attachments[xml_path.name] = filespec
    pdf.save(output_path)


#db n excel 
def create_dcc(db: Session, dcc: schemas.DCCFormCreate):
    logging.info("Starting DCC creation process")
    
    excel_file = dcc.attachment.excel_file 
    sheet_name = dcc.attachment.sheet_name 
    
    # Inisialisasi variabel Office
    excel = None
    word = None
    wb = None
    
    try:
        logging.debug("Creating DCC model instance")
        
        measurement_timeline_data = {
            "tgl_mulai": dcc.Measurement_TimeLine.tgl_mulai,  # Langsung ambil dari form data
            "tgl_akhir": dcc.Measurement_TimeLine.tgl_akhir,
            "tgl_pengesahan": dcc.Measurement_TimeLine.tgl_pengesahan,
        }
        
        administrative_data_dict = {
            "country_code": administrative_data.country_code,  # Country of Calibration
            "used_languages": json.dumps(administrative_data.used_languages),
            "mandatory_languages": json.dumps(administrative_data.mandatory_languages),
            "order": administrative_data.order,  # Order Number
            "core_issuer": administrative_data.core_issuer,  # Core Issuer
            "sertifikat": administrative_data.sertifikat,  # Certificate Number
            "tempat": administrative_data.tempat,  # Calibration Place in XML format
            "tempat_pdf": administrative_data.tempat_pdf,  # Calibration Place in PDF format
        }
        
        # Menyiapkan data kondisi (Suhu, Kelembapan, dan lainnya)
        environmental_conditions = []
        for condition in dcc.conditions.environmental_conditions:
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
            measurement_timeline=measurement_timeline_data,
            objects_description=json.dumps([obj.dict() for obj in dcc.objects]),
            responsible_persons=json.dumps(responsible_persons_data),
            owner=json.dumps(dcc.owner.dict()),
            methods=json.dumps(methods_data),
            equipments=json.dumps([equip.dict() for equip in dcc.equipments]),
            conditions=json.dumps(conditions_data), 
            excel=dcc.excel,
            sheet_name=dcc.sheet_name,
            statements=json.dumps([stmt.dict() for stmt in dcc.statements]),
        )

        logging.info(f"Saving DCC: {dcc.sertifikat} to the database")
        db.add(db_dcc)
        db.commit()
        db.refresh(db_dcc)
        logging.info(f"DCC {dcc.sertifikat} saved successfully with ID {db_dcc.id}")
        
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

        # Proses Excel (masuk ke word)
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