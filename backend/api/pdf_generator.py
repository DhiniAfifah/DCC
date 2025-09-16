import os
import base64
import tempfile
import xml.etree.ElementTree as ET
import matplotlib.pyplot as plt
from jinja2 import Template, DebugUndefined
from weasyprint import HTML
import logging
from datetime import datetime
import traceback
from io import BytesIO
from api.ds_i_utils import d_si
from api.ds_i_utils import convert_latex_unit
import subprocess
import sys
from pathlib import Path
from pikepdf import Pdf, AttachedFileSpec

# Konfigurasi logging
logging.basicConfig(level=logging.INFO)  # or logging.ERROR if you want to suppress your own logs too
logger = logging.getLogger("PDF Generator")

# Suppress weasyprint and fontTools logging
logging.getLogger('weasyprint').setLevel(logging.ERROR)
logging.getLogger('fontTools').setLevel(logging.ERROR)
logging.getLogger('fontTools.subset').setLevel(logging.ERROR)
logging.getLogger('fontTools.ttLib.ttFont').setLevel(logging.ERROR)

# Namespace untuk parsing XML
XML_NS = {
    'dcc': 'https://ptb.de/dcc',
    'si': 'https://ptb.de/si'
}

def render_latex_base64(latex_expr: str) -> str:
        fig = plt.figure(figsize=(0.01, 0.01), dpi=200)
        fig.text(0.1, 0.5, f"${latex_expr}$", fontsize=14)
        plt.axis('off')
        buf = BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=200)
        plt.close(fig)
        encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"

def format_tanggal_by_lang(tanggal_str, lang='id'):
    if not tanggal_str:
        return ''

    try:
        dt = datetime.strptime(tanggal_str, '%Y-%m-%d')
        bulan = {
            'id': [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ],
            'en': [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ]
        }

        nama_bulan = bulan.get(lang, bulan['id'])[dt.month - 1]
        return f"{dt.day} {nama_bulan} {dt.year}"

    except ValueError:
        return tanggal_str

class PDFGenerator:
    def __init__(self, template_path=None):
        if template_path is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            parent_dir = os.path.dirname(current_dir)
            template_path = os.path.join(parent_dir, 'assets', 'template DCC.html')
        
        self.template_path = template_path
        logger.info(f"Using template path: {self.template_path}")
        if not os.path.exists(self.template_path):
            logger.error(f"Template file not found at {self.template_path}")
            return False
        
        self.temp_dir = tempfile.TemporaryDirectory()
        logger.info(f"Using temporary directory: {self.temp_dir.name}")
    
    def _get_text_by_lang(self, text_obj, lang='id'):
        """
        Helper function to safely get text by language
        Returns the text in specified language, or first available, or empty string
        """
        try:
            if isinstance(text_obj, dict):
                # If it's a dictionary, try to get the specified language
                if lang in text_obj:
                    return text_obj[lang]
                # If specified language not found, try 'id' first, then 'en', then any available
                for fallback_lang in ['id', 'en']:
                    if fallback_lang in text_obj:
                        return text_obj[fallback_lang]
                # If no common languages found, return first available value
                if text_obj:
                    return list(text_obj.values())[0]
                return ""
            elif isinstance(text_obj, str):
                # If it's already a string, return as is
                return text_obj
            elif text_obj is None:
                return ""
            else:
                # If it's some other type, try to convert to string
                return str(text_obj)
        except Exception as e:
            logger.warning(f"Error in _get_text_by_lang: {e}, text_obj: {text_obj}")
            return ""
    
    def _safe_get_multilang_dict(self, text_obj):
        """
        Safely convert text object to multilingual dictionary
        """
        try:
            if isinstance(text_obj, dict):
                return text_obj
            elif isinstance(text_obj, str):
                return {'id': text_obj, 'en': text_obj}
            elif text_obj is None:
                return {'id': '', 'en': ''}
            else:
                str_val = str(text_obj)
                return {'id': str_val, 'en': str_val}
        except Exception as e:
            logger.warning(f"Error in _safe_get_multilang_dict: {e}, text_obj: {text_obj}")
            return {'id': '', 'en': ''}

    def _debug_data_structure(self, data, max_depth=3, current_depth=0):
        """Debug function to analyze data structure"""
        debug_info = {}
        
        if current_depth >= max_depth:
            return f"Max depth reached: {type(data)}"
            
        if isinstance(data, dict):
            debug_info = {}
            for key, value in data.items():
                try:
                    if hasattr(value, 'items') and not isinstance(value, str):
                        debug_info[key] = f"Dict with {len(value)} items"
                    elif isinstance(value, list):
                        debug_info[key] = f"List with {len(value)} items"
                    elif isinstance(value, str):
                        debug_info[key] = f"String: '{value[:50]}...'" if len(value) > 50 else f"String: '{value}'"
                    else:
                        debug_info[key] = f"{type(value).__name__}: {value}"
                except Exception as e:
                    debug_info[key] = f"Error analyzing: {e}"
        elif isinstance(data, list):
            debug_info = []
            for i, item in enumerate(data[:5]):  # Only show first 5 items
                debug_info.append(self._debug_data_structure(item, max_depth, current_depth + 1))
                
        return debug_info

    def _get_multilang_text(self, element):
        """Ekstrak teks multi-bahasa dari elemen XML"""
        if element is None:
            return {}
        
        # Handle case where element has no children
        if len(element) == 0:
            # If element has text directly, use it
            if element.text:
                return {'id': element.text.strip()}
            return {}
        
        texts = {}
        for content_elem in element.findall('.//dcc:content', namespaces=XML_NS):
            lang = content_elem.get('lang', 'id')
            texts[lang] = content_elem.text.strip() if content_elem.text else ""
        
        # If no content elements found, try to get text directly
        if not texts and element.text:
            texts['id'] = element.text.strip()
            
        return texts
    
    def restore_correction_data(self, results, corrections):
        """Restore correction labels and flip signs back for PDF display"""
        if not corrections:
            return results
        
        for result_idx, result in enumerate(results):
            if result_idx in corrections:
                correction_cols = corrections[result_idx]
                
                for col_idx, column in enumerate(result.get('columns', [])):
                    if col_idx in correction_cols:
                        correction_info = correction_cols[col_idx]
                        
                        # Restore the original column name (Correction instead of Error)
                        if correction_info.get('is_correction'):
                            original_kolom = correction_info.get('kolom', {})
                            for lang, text in original_kolom.items():
                                if column.get('name', {}).get(lang) == "Error":
                                    column['name'][lang] = text
                        
                        # Flip the signs back in subcolumn data
                        for subcolumn in column.get('subcolumn', []):
                            if 'value' in subcolumn and subcolumn['value']:
                                # Flip signs back by calling invert_number_str again
                                subcolumn['value'] = [
                                    self.invert_number_str(val) for val in subcolumn['value']
                                ]
        
        return results

    def invert_number_str(self, n: str) -> str:
        """Invert sign of a numeric string while preserving format."""
        n = n.strip()
        if not n:
            return n
        
        # Handle explicit + sign
        if n.startswith("+"):
            return "-" + n[1:]
        elif n.startswith("-"):
            return n[1:]  # remove the minus → makes it positive
        else:
            return "-" + n  # add minus if positive

    def __del__(self):
        try:
            self.temp_dir.cleanup()
        except:
            pass

    def extract_data_from_xml(self, xml_content, tempat_pdf, captions=None, corrections=None):
        """Ekstrak data dari XML ke struktur Python"""
        try:
            root = ET.fromstring(xml_content)

            if captions is None:
                captions = {'methods': {}, 'statements': {}}
            
            # Extract all data
            responsible_persons = self._extract_responsible_persons(root) or {
                'pelaksana': [], 'penyelia': [], 'kepala': {}, 'direktur': {}
            }

            raw_results = self._extract_results(root)

            # Pastikan 'results' adalah list of dicts
            if isinstance(raw_results, list):
                results = raw_results
            elif isinstance(raw_results, dict):
                results = [raw_results]
            else:
                results = [{
                    'parameters': {}, 'columns': [], 'uncertainty': {}
                }]

            if corrections:
                results = self.restore_correction_data(results, corrections)
            
            data = {
                'admin': self._extract_admin_data(root, tempat_pdf) or {},
                'Measurement_TimeLine': self._extract_timeline(root) or {},
                'objects': self._extract_objects(root) or [],
                'responsible_persons': responsible_persons,
                'owner': self._extract_owner(root) or {},
                'methods': self._extract_methods(root, captions.get('methods', {})) or [],
                'equipments': self._extract_equipments(root) or [],
                'conditions': self._extract_conditions(root) or [],
                'results': results,
                'statements': self._extract_statements(root, captions.get('statements', {})) or [],
                'direktur': responsible_persons.get('direktur', {}),
                'kepala': responsible_persons.get('kepala', {}),
                'penyelia': responsible_persons.get('penyelia', []),
                'pelaksana': responsible_persons.get('pelaksana', []),
                # Add helper functions for template
                'get_text': self._get_text_by_lang,
                'safe_dict': self._safe_get_multilang_dict
            }
            
            return data
            
        except Exception as e:
            logger.error(f"Error extracting data from XML: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise

    def _extract_admin_data(self, root, tempat_pdf):
        return {
            'certificate': root.findtext('.//dcc:uniqueIdentifier', namespaces=XML_NS) or '',
            'order': root.findtext('.//dcc:identification[@refType="basic_orderNumber"]/dcc:value', namespaces=XML_NS) or '',
            'tempat': tempat_pdf or root.findtext('.//dcc:performanceLocation', namespaces=XML_NS)
        }

    def _extract_timeline(self, root): 
        # Deteksi bahasa utama dari salah satu tag
        lang_elem = root.find('.//dcc:declaration/dcc:content', namespaces=XML_NS)
        lang = lang_elem.attrib.get('lang', 'id') if lang_elem is not None else 'id'

        mulai = root.findtext('.//dcc:beginPerformanceDate', namespaces=XML_NS) or ''
        akhir = root.findtext('.//dcc:endPerformanceDate', namespaces=XML_NS) or ''
        pengesahan = root.findtext('.//dcc:issueDate', namespaces=XML_NS) or ''

        return {
            'tgl_mulai': format_tanggal_by_lang(mulai, lang),
            'tgl_akhir': format_tanggal_by_lang(akhir, lang),
            'tgl_pengesahan': format_tanggal_by_lang(pengesahan, lang)
        }
    
    def _extract_objects(self, root):
        objects = []
        for obj in root.findall('.//dcc:items/dcc:item', namespaces=XML_NS):
            jenis_elem = obj.find('.//dcc:name', namespaces=XML_NS)
            merek = obj.findtext('.//dcc:manufacturer/dcc:name/dcc:content', namespaces=XML_NS) or "-"
            tipe = obj.findtext('.//dcc:model', namespaces=XML_NS) or "-"
            seri = obj.findtext('.//dcc:identifications/dcc:identification[@refType="basic_serialNumber"]/dcc:value', namespaces=XML_NS) or "-"
            id_lain_elem = obj.find('.//dcc:identifications/dcc:identification[@refType="basic_serialNumber"]/dcc:name', namespaces=XML_NS)

            # Pastikan selalu dictionary
            jenis = self._get_multilang_text(jenis_elem) if jenis_elem is not None else {}
            id_lain = self._get_multilang_text(id_lain_elem) if id_lain_elem is not None else {}

            objects.append({
                'jenis': jenis,
                'merek': merek,
                'tipe': tipe,
                'seri_item': seri,
                'id_lain': id_lain
            })
        return objects

    def _extract_responsible_persons(self, root):
        roles = {
            'pelaksana': [],
            'penyelia': [],
            'kepala': {},
            'direktur': {}
        }

        for resp in root.findall('.//dcc:respPersons/dcc:respPerson', namespaces=XML_NS):
            person = {
                'nama_resp': resp.findtext('.//dcc:person/dcc:name/dcc:content', namespaces=XML_NS) or '',
                'nip': resp.findtext('.//dcc:description/dcc:content', namespaces=XML_NS) or '',
                'peran': resp.findtext('.//dcc:role', namespaces=XML_NS) or ''
            }

            role = person['peran']
            if 'Pelaksana' in role:
                roles['pelaksana'].append(person)
            elif 'Penyelia' in role:
                roles['penyelia'].append(person)
            elif 'Kepala' in role:
                roles['kepala'] = person
            elif 'Direktur' in role:
                roles['direktur'] = person

        return roles

    def _extract_owner(self, root):
        owner_elem = root.find('.//dcc:customer/dcc:location', namespaces=XML_NS)
        if owner_elem is None:
            return {
                'nama_cust': '',
                'jalan_cust': '',
                'no_jalan_cust': '',
                'kota_cust': '',
                'state_cust': '',
                'pos_cust': '',
                'negara_cust': ''
            }
            
        return {
            'nama_cust': root.findtext('.//dcc:customer/dcc:name/dcc:content', namespaces=XML_NS) or '',
            'jalan_cust': owner_elem.findtext('.//dcc:street', namespaces=XML_NS) or '',
            'no_jalan_cust': owner_elem.findtext('.//dcc:streetNo', namespaces=XML_NS) or '',
            'kota_cust': owner_elem.findtext('.//dcc:city', namespaces=XML_NS) or '',
            'state_cust': owner_elem.findtext('.//dcc:state', namespaces=XML_NS) or '',
            'pos_cust': owner_elem.findtext('.//dcc:postCode', namespaces=XML_NS) or '',
            'negara_cust': root.findtext('.//dcc:customer/dcc:countryCode', namespaces=XML_NS) or ''
        }
    
    def _extract_equipments(self, root):
        equipments = []
        for eq in root.findall('.//dcc:measurementResults/dcc:measurementResult/dcc:measuringEquipments/dcc:measuringEquipment', namespaces=XML_NS):
            nama_alat = self._get_multilang_text(eq.find('.//dcc:name', namespaces=XML_NS))
            manuf_model = self._get_multilang_text(eq.find('.//dcc:identifications/dcc:identification[@refType="basic_serialNumber"]/dcc:name', namespaces=XML_NS))
            model = self._get_multilang_text(eq.find('.//dcc:manufacturer/dcc:name', namespaces=XML_NS))
            seri = eq.findtext('.//dcc:identifications/dcc:identification[@refType="basic_serialNumber"]/dcc:value', namespaces=XML_NS) or '-'

            # Pastikan tidak ada nilai None
            equipments.append({
                'nama_alat': nama_alat if nama_alat else {},
                'manuf_model': manuf_model if manuf_model else {},
                'model': model,
                'seri_measuring': seri
            })
        return equipments
    
    def _extract_conditions(self, root):
        conditions = []
        for cond in root.findall('.//dcc:influenceConditions/dcc:influenceCondition', namespaces=XML_NS):
            jenis_kondisi = cond.findtext('.//dcc:name/dcc:content', namespaces=XML_NS) or ''
            min_value = cond.findtext('.//dcc:quantity[@refType="math_minimum"]/si:real/si:value', namespaces=XML_NS) or ''
            tengah_unit = cond.findtext('.//dcc:quantity[@refType="math_minimum"]/si:real/si:unit', namespaces=XML_NS) or ''
            max_value = cond.findtext('.//dcc:quantity[@refType="math_maximum"]/si:real/si:value', namespaces=XML_NS) or ''
            rentang_unit = cond.findtext('.//dcc:quantity[@refType="math_maximum"]/si:real/si:unit', namespaces=XML_NS) or ''

            tengah_unit = convert_latex_unit(tengah_unit)
            rentang_unit = convert_latex_unit(rentang_unit)

            conditions.append({
                'jenis_kondisi': jenis_kondisi if jenis_kondisi else {},
                'min_value': min_value,
                'tengah_unit': tengah_unit,
                'max_value': max_value,
                'rentang_unit': rentang_unit
            })
        return conditions
    
    def _extract_methods(self, root, method_captions=None):
        methods = []

        if method_captions is None:
            method_captions = {}

        for i, met in enumerate(root.findall('.//dcc:measurementResults/dcc:measurementResult/dcc:usedMethods/dcc:usedMethod', namespaces=XML_NS)):
            method_name = self._get_multilang_text(met.find('.//dcc:name', namespaces=XML_NS))
            method_desc = self._get_multilang_text(met.find('.//dcc:description', namespaces=XML_NS))

            #Formula
            formula_image = None
            formula_elem = met.find('.//dcc:description/dcc:formula/dcc:latex', namespaces=XML_NS)
            if formula_elem is not None and formula_elem.text:
                try:
                    formula_image = render_latex_base64(formula_elem.text.strip())
                except Exception as e:
                    logging.warning(f"[METHOD] Gagal render latex: {e}")

            #Gambar
            image_data = None
            image_caption = method_captions.get(i, "")
            file_elem = met.find('.//dcc:description/dcc:file', namespaces=XML_NS)
            if file_elem is not None:
                mime_elem = file_elem.find('dcc:mimeType', namespaces=XML_NS)
                data_elem = file_elem.find('dcc:dataBase64', namespaces=XML_NS)

                if mime_elem is not None and data_elem is not None and data_elem.text:
                    try:
                        mimetype = mime_elem.text.strip()
                        b64 = data_elem.text.strip().replace('\n', '').replace(' ', '')
                        image_data = f"data:{mimetype};base64,{b64}"
                    except Exception as e:
                        logging.warning(f"[METHOD] Gagal decode gambar: {e}")

            methods.append({
                'method_name': method_name if method_name else {},
                'method_desc': method_desc if method_desc else {},
                'formula_image': formula_image,
                'image': image_data,
                'image_caption': image_caption
            })

        return methods
  
    def _extract_statements(self, root, statement_captions=None):
        statements = []

        if statement_captions is None:
            statement_captions = {}

        for i, stmt in enumerate(root.findall('.//dcc:statements/dcc:statement', namespaces=XML_NS)):
            declaration = stmt.find('.//dcc:declaration', namespaces=XML_NS)

            # multi-bahasa
            value = self._get_multilang_text(declaration)

            #Formula
            formula_image = None
            formula_elem = declaration.find('.//dcc:formula/dcc:latex', namespaces=XML_NS)
            if formula_elem is not None and formula_elem.text:
                try:
                    formula_image = render_latex_base64(formula_elem.text.strip())
                except Exception as e:
                    logging.warning(f"Gagal render rumus latex: {e}")

            #Gambar
            image_data = None
            image_caption = statement_captions.get(i, "")
            file_elem = declaration.find('dcc:file', namespaces=XML_NS)
            if file_elem is not None:
                mime_elem = file_elem.find('dcc:mimeType', namespaces=XML_NS)
                data_elem = file_elem.find('dcc:dataBase64', namespaces=XML_NS)

                if mime_elem is not None and data_elem is not None and data_elem.text:
                    try:
                        mimetype = mime_elem.text.strip()
                        b64 = data_elem.text.strip().replace('\n', '').replace(' ', '')
                        image_data = f"data:{mimetype};base64,{b64}"
                    except Exception as e:
                        logging.warning(f"Gagal decode gambar pernyataan: {e}")

            statements.append({
                'value': value if value else {},
                'formula_image': formula_image,
                'image': image_data,
                'image_caption': image_caption
            })

        return statements

    def _extract_results(self, root):
        results = []
    
        for result in root.findall('.//dcc:result', namespaces=XML_NS):
            param_multilang = self._get_multilang_text(result.find('./dcc:name', namespaces=XML_NS))
    
            columns = []
            uncertainty_data = {}
    
            # Prepare variable to capture reference units
            ref_units = None
    
            for quantity in result.findall('.//dcc:quantity', namespaces=XML_NS):
                col_name = self._get_multilang_text(quantity.find('./dcc:name', namespaces=XML_NS))
                ref_type = quantity.attrib.get('refType', '')
    
                subcolumn_data = []
                for rl in quantity.findall('./si:realListXMLList', namespaces=XML_NS):
                    values = (rl.findtext('./si:valueXMLList', namespaces=XML_NS) or '').strip().split()
                    raw_units = (rl.findtext('./si:unitXMLList', namespaces=XML_NS) or '').strip().split()
                    units = [convert_latex_unit(u) for u in raw_units]
    
                    subcolumn_data.append({
                        'value': values,
                        'unit': units
                    })
    
                    # Capture the units from measurementError or fallback to nominalValue
                    if ref_units is None and ref_type in ['basic_measurementError', 'basic_nominalValue']:
                        ref_units = units  # This captures the first set of units found
    
                columns.append({
                    'name': col_name,
                    'subcolumn': subcolumn_data
                })
    
                unc = quantity.find('.//si:expandedMUXMLList', namespaces=XML_NS)
                if unc is not None:
                    uncertainty_data = {
                        'value': (unc.findtext('./si:valueExpandedMUXMLList', namespaces=XML_NS) or '').strip().split(),
                        'factor': (unc.findtext('./si:coverageFactorXMLList', namespaces=XML_NS) or '').strip(),
                        'probability': (unc.findtext('./si:coverageProbabilityXMLList', namespaces=XML_NS) or '').strip(),
                        'unit': ref_units if ref_units else []
                    }
    
            results.append({
                'parameters': param_multilang,
                'columns': columns,
                'uncertainty': uncertainty_data
            })
    
        return results
    
    def create_formula_image(self, formula, prefix, index):
        """Buat gambar PNG dari formula matematika"""
        if not formula:
            return None
        
        filename = os.path.join(self.temp_dir.name, f"{prefix}_{index}.png")
        try:
            fig = plt.figure(figsize=(1.5, 0.5))
            fig.text(0.1, 0.5, f"${formula}$", fontsize=10)
            fig.savefig(filename, dpi=300, bbox_inches='tight', pad_inches=0.05)
            plt.close(fig)
            return filename
        except Exception as e:
            logger.error(f"Error creating formula image: {e}")
            return None

    def test_template_rendering(self, data):
        """Test template rendering with better error handling"""
        try:
            
            # Read template
            with open(self.template_path, 'r', encoding='utf-8') as f:
                template_html = f.read()
            
            # Create Jinja2 template with debug undefined
            template = Template(template_html, undefined=DebugUndefined)
            
            # Add custom functions to the template environment
            template.globals['get_text'] = self._get_text_by_lang
            template.globals['safe_dict'] = self._safe_get_multilang_dict
            
            # Try rendering
            logger.info("Attempting to render template...")
            rendered_html = template.render(**data)
            
            logger.info("Template rendered successfully!")
            return rendered_html
            
        except Exception as e:
            logger.error(f"Template rendering failed: {e}")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            
            # Try to identify problematic variables
            logger.info("=== DEBUGGING DATA FOR TEMPLATE ===")
            for key, value in data.items():
                if callable(value):
                    continue
                try:
                    logger.info(f"{key}: {type(value)} - {str(value)[:100]}...")
                    if hasattr(value, 'items') and not isinstance(value, str):
                        logger.info(f"  -> Has .items() method")
                    if isinstance(value, str):
                        logger.info(f"  -> Is string, length: {len(value)}")
                except Exception as debug_error:
                    logger.error(f"  -> Error debugging {key}: {debug_error}")
            
            raise
    
    def convert_pdf_to_pdfa3(selft, input_pdf_path, output_pdf_path, ghostscript_path=None):
        
        # Auto-detect Ghostscript executable if not provided
        if not ghostscript_path:
            if sys.platform.startswith('win'):
                # Common Windows locations
                possible_paths = [
                    r"C:\Program Files\gs\gs*\bin\gswin64c.exe",
                    r"C:\Program Files (x86)\gs\gs*\bin\gswin32c.exe",
                    "gswin64c.exe",  # If in PATH
                    "gswin32c.exe"   # If in PATH
                ]
            else:
                # Linux/macOS
                possible_paths = ["gs"]
            
            ghostscript_path = None
            for path in possible_paths:
                try:
                    if '*' in path:
                        # Handle wildcard paths for Windows
                        import glob
                        matches = glob.glob(path)
                        if matches:
                            ghostscript_path = matches[0]
                            break
                    else:
                        subprocess.run([path, "--version"], 
                                    capture_output=True, check=True)
                        ghostscript_path = path
                        break
                except (subprocess.CalledProcessError, FileNotFoundError):
                    continue
            
            if not ghostscript_path:
                raise FileNotFoundError("Ghostscript not found. Please install Ghostscript or provide the path.")
        
        # Validate input file
        if not os.path.exists(input_pdf_path):
            raise FileNotFoundError(f"Input PDF file not found: {input_pdf_path}")
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_pdf_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Ghostscript command for PDF/A-3 conversion
        gs_command = [
            ghostscript_path,
            "-dPDFA=3",                    # PDF/A-3 compliance level
            "-dBATCH",                     # Exit after processing
            "-dNOPAUSE",                   # Don't pause between pages
            "-dSAFER",                     # Restrict file operations
            "-dQUIET",                     # Suppress info messages
            "-dUseCIEColor=true",          # Use CIE color space
            "-sColorConversionStrategy=UseDeviceIndependentColor",
            "-sDEVICE=pdfwrite",           # Output device
            "-dPDFACompatibilityPolicy=1", # Convert non-compliant elements
            f"-sOutputFile={output_pdf_path}",
            input_pdf_path
        ]
        
        try:
            # Run Ghostscript command
            result = subprocess.run(gs_command, 
                                capture_output=True, 
                                text=True, 
                                check=True)
            
            # Check if output file was created
            if os.path.exists(output_pdf_path):
                logger.info(f"Successfully converted to PDF/A-3: {output_pdf_path}")
                return True
            else:
                logger.error("Conversion failed: Output file not created")
                return False
                
        except subprocess.CalledProcessError as e:
            logger.error(f"Ghostscript error: {e}")
            logger.error(f"Command: {' '.join(gs_command)}")
            if e.stderr:
                logger.error(f"Error output: {e.stderr}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return False

    def generate_pdf_with_embedded_xml(self, xml_content: str, output_path: str, xml_path: str, tempat_pdf, captions=None, corrections=None) -> bool:
        try:
            # Generate PDF sementara tanpa embedded XML
            temp_pdf_path = os.path.join(self.temp_dir.name, "temp.pdf")
            if not self.generate_pdf(xml_path, temp_pdf_path, tempat_pdf, captions, corrections):
                return False

            # Konversi ke PDF/A-3a
            try:
                success = self.convert_pdf_to_pdfa3(temp_pdf_path, output_path)
                if success:
                    logger.info("Conversion completed successfully!")
                else:
                    logger.error("Conversion failed!")
            except Exception as e:
                logger.error(f"Error: {e}")
            
            # Tambahkan attachment XML ke PDF/A
            pdf = Pdf.open(output_path, allow_overwriting_input=True)
            filespec = AttachedFileSpec.from_filepath(pdf, xml_path)
            pdf.attachments["dcc_data.xml"] = filespec
            pdf.save(output_path)

            return True
        except Exception as e:
            logger.error(f"PDF generation with embedded XML failed: {e}")
            return False

    def generate_pdf(self, xml_path, output_path, tempat_pdf, captions=None, corrections=None):
        """Generate PDF dari konten XML"""
        try:
            
             # Pastikan direktori output ada
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            logger.info(f"Processing XML file: {xml_path}")
            
            # Baca file XML
            with open(xml_path, 'r', encoding='utf-8') as f:
                xml_content = f.read()
            
            # Ekstrak data dari XML
            logger.info("Extracting data from XML...")
            data = self.extract_data_from_xml(xml_content, tempat_pdf, captions, corrections)
            
            # Perbaiki base_url ke direktori assets yang benar
            current_dir = os.path.dirname(os.path.abspath(__file__))
            parent_dir = os.path.dirname(current_dir)
            assets_path = os.path.join(parent_dir, 'assets')
            base_url = 'file:///' + assets_path.replace('\\', '/')
            logger.info(f"Corrected base_url: {base_url}")
            
            # Baca template HTML
            with open(self.template_path, 'r', encoding='utf-8') as f:
                template_html = f.read()
                
            # Render template
            logger.info("Rendering HTML template...")
            template = Template(template_html, undefined=DebugUndefined)
            template.globals['get_text'] = self._get_text_by_lang
            template.globals['safe_dict'] = self._safe_get_multilang_dict

            # 5. Render pertama (tanpa total_pages)
            rendered_html = template.render(**data)

            # 6. Hitung jumlah halaman PDF
            total_pages = len(HTML(string=rendered_html, base_url=base_url).render().pages)
            data['total_pages'] = total_pages  # masukkan ke context

            # 7. Render ulang HTML dengan jumlah halaman
            final_html = template.render(**data)
            
            # 8. Buat PDF
            logger.info(f"Generating PDF to: {output_path}")
            HTML(
                string=final_html,
                base_url=base_url
            ).write_pdf(
                output_path,
                pdfa='PDF/A-3b',
                metadata={
                    'title': 'Digital Calibration Certificate',
                    'author': 'SNSU-BSN',
                    'creationDate': datetime.now()
                }
            )

            if os.path.exists(output_path):
                logger.info(f"PDF successfully generated: {output_path} ({os.path.getsize(output_path)} bytes)")
                return True
            else:
                logger.error("PDF generation failed - no output file created")
                return False

        except Exception as e:
            logger.error(f"PDF generation failed: {e}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return False