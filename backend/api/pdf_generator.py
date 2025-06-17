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

    #FUNGSI MULTI LANG
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

    def __del__(self):
        try:
            self.temp_dir.cleanup()
        except:
            pass

    def extract_data_from_xml(self, xml_content):
        """Ekstrak data dari XML ke struktur Python"""
        try:
            root = ET.fromstring(xml_content)
            
            # Extract all data
            responsible_persons = self._extract_responsible_persons(root) or {
                'pelaksana': [], 'penyelia': [], 'kepala': {}, 'direktur': {}
            }
            
            data = {
                'admin': self._extract_admin_data(root) or {},
                'Measurement_TimeLine': self._extract_timeline(root) or {},
                'objects': self._extract_objects(root) or [],
                'responsible_persons': responsible_persons,
                'owner': self._extract_owner(root) or {},
                'methods': self._extract_methods(root) or [],
                'equipments': self._extract_equipments(root) or [],
                'conditions': self._extract_conditions(root) or [],
                'uncertainty': self._extract_uncertainty(root) or {
                    'probability': '', 'factor': ''
                },
                'statements': self._extract_statements(root) or [],
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

    #ADMIN
    def _extract_admin_data(self, root):
        return {
            'certificate': root.findtext('.//dcc:uniqueIdentifier', namespaces=XML_NS) or '',
            'order': root.findtext('.//dcc:identification[@refType="basic_orderNumber"]/dcc:value', namespaces=XML_NS) or '',
            'tempat': root.findtext('.//dcc:performanceLocation', namespaces=XML_NS) or ''
        }

    # TIMELINE
    def _extract_timeline(self, root): 
        return {
            'tgl_mulai': root.findtext('.//dcc:beginPerformanceDate', namespaces=XML_NS) or '',
            'tgl_akhir': root.findtext('.//dcc:endPerformanceDate', namespaces=XML_NS) or '',
            'tgl_pengesahan': root.findtext('.//dcc:issueDate', namespaces=XML_NS) or ''
        }
    
    #OBJECT
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

    #RESPONSIBLE PERSONS
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

    #OWNER
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
    
    #EQUIPMENT
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
    
    #CONDITIONS
    def _extract_conditions(self, root):
        conditions = []
        for cond in root.findall('.//dcc:influenceConditions/dcc:influenceCondition', namespaces=XML_NS):
            jenis_kondisi = cond.findtext('.//dcc:name/dcc:content', namespaces=XML_NS) or ''
            tengah = cond.findtext('.//dcc:quantity[@refType="math_minimum"]/si:real/si:value', namespaces=XML_NS) or ''
            tengah_unit = cond.findtext('.//dcc:quantity[@refType="math_minimum"]/si:real/si:unit', namespaces=XML_NS) or ''
            rentang = cond.findtext('.//dcc:quantity[@refType="math_maximum"]/si:real/si:value', namespaces=XML_NS) or ''
            rentang_unit = cond.findtext('.//dcc:quantity[@refType="math_maximum"]/si:real/si:unit', namespaces=XML_NS) or ''

            conditions.append({
                'jenis_kondisi': jenis_kondisi if jenis_kondisi else {},
                'tengah': tengah,
                'tengah_unit': tengah_unit,
                'rentang': rentang,
                'rentang_unit': rentang_unit
            })
        return conditions
    
    #METHOD
    def _extract_methods(self, root):
        methods = []
        for met in root.findall('.//dcc:measurementResults/dcc:measurementResult/dcc:usedMethods/dcc:usedMethod', namespaces=XML_NS):
            method_name = self._get_multilang_text(met.find('.//dcc:name', namespaces=XML_NS))
            method_desc = self._get_multilang_text(met.find('.//dcc:description', namespaces=XML_NS))

            methods.append({
                'method_name': method_name if method_name else {},
                'method_desc': method_desc if method_desc else {}
            })
        return methods
    
    #STATEMENT
    def _extract_statements(self, root):
        statements = []
        for stmt in root.findall('.//dcc:statements/dcc:statement', namespaces=XML_NS):
            declaration = self._get_multilang_text(stmt.find('.//dcc:declaration', namespaces=XML_NS))
            statements.append({
                'value': declaration if declaration else {}
            })
        return statements

    # UNCERTAINTY
    def _extract_uncertainty(self, root):
        uncert = root.find('.//si:measurementUncertaintyUnivariateXMLList', namespaces=XML_NS)
        if uncert is None:
            return {
                'probability': '',
                'factor': ''
            }
        return {
            'probability': uncert.findtext('.//si:coverageProbabilityXMLList', namespaces=XML_NS) or '',
            'factor': uncert.findtext('.//si:coverageFactorXMLList', namespaces=XML_NS) or ''
        }
    
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

    def generate_pdf(self, xml_path, output_path):
        """Generate PDF dari konten XML"""
        try:
            # Read XML file
            with open(xml_path, 'r', encoding='utf-8') as f:
                xml_content = f.read()
            
            logger.info(f"XML file loaded, size: {len(xml_content)} characters")
            
            # Extract data from XML
            logger.info("Extracting data from XML...")
            data = self.extract_data_from_xml(xml_content)
            
            # Test template rendering
            rendered_html = self.test_template_rendering(data)
            
            # Generate PDF/A-3
            logger.info("Generating PDF...")
            HTML(string=rendered_html).write_pdf(
                output_path,
                pdfa='PDF/A-3b',
                metadata={
                    'title': 'Digital Calibration Certificate',
                    'author': 'SNSU-BSN',
                    'creationDate': datetime.now()
                }
            )
            
            logger.info(f"PDF generated successfully at {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"PDF generation failed: {e}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return False
        
if __name__ == "__main__":
    generator = PDFGenerator()
    generator.generate_pdf("16.xml", "test.pdf")