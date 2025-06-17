import os
import base64
import tempfile
import xml.etree.ElementTree as ET
import matplotlib.pyplot as plt
from jinja2 import Template
from weasyprint import HTML
import logging
from datetime import datetime

# Konfigurasi logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PDF Generator")

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
            # Don't return False here, just log the error
        
        self.temp_dir = tempfile.TemporaryDirectory()
        logger.info(f"Using temporary directory: {self.temp_dir.name}")
    
    def _get_multilang_text(self, element):
        """Ekstrak teks multi-bahasa dari elemen XML"""
        if element is None:
            return {}
        
        texts = {}
        for content_elem in element.findall('.//dcc:content', namespaces=XML_NS):
            lang = content_elem.get('lang', 'id')
            text_content = content_elem.text
            texts[lang] = text_content.strip() if text_content else ""
        
        # If no multilang content found, check if element has text directly
        if not texts and element.text:
            texts['id'] = element.text.strip()
            
        return texts

    def __del__(self):
        if hasattr(self, 'temp_dir'):
            self.temp_dir.cleanup()

    def extract_data_from_xml(self, xml_content):
        """Ekstrak data dari XML ke struktur Python"""
        try:
            root = ET.fromstring(xml_content)
        except ET.ParseError as e:
            logger.error(f"XML parsing error: {e}")
            return self._get_empty_data_structure()
        
        # Extract all data with proper error handling
        responsible_persons = self._extract_responsible_persons(root)
        
        data = {
            'admin': self._extract_admin_data(root),
            'Measurement_TimeLine': self._extract_timeline(root),
            'objects': self._extract_objects(root),
            'responsible_persons': responsible_persons,
            'owner': self._extract_owner(root),
            'methods': self._extract_methods(root),
            'equipments': self._extract_equipments(root),
            'conditions': self._extract_conditions(root),
            'uncertainty': self._extract_uncertainty(root),
            'statements': self._extract_statements(root),
            # Redundant fields for backward compatibility
            'kepala': responsible_persons.get('kepala', {}),
            'penyelia': responsible_persons.get('penyelia', []),
            'pelaksana': responsible_persons.get('pelaksana', [])
        }

        return data
    
    def _get_empty_data_structure(self):
        """Return empty data structure when XML parsing fails"""
        return {
            'admin': {'certificate': '', 'order': '', 'tempat': ''},
            'Measurement_TimeLine': {'tgl_mulai': '', 'tgl_akhir': '', 'tgl_pengesahan': ''},
            'objects': [],
            'responsible_persons': {'pelaksana': [], 'penyelia': [], 'kepala': {}, 'direktur': {}},
            'owner': {'nama_cust': '', 'jalan_cust': '', 'no_jalan_cust': '', 'kota_cust': '', 'state_cust': '', 'pos_cust': '', 'negara_cust': ''},
            'methods': [],
            'equipments': [],
            'conditions': [],
            'uncertainty': {'probability': '', 'factor': ''},
            'statements': [],
            'kepala': {},
            'penyelia': [],
            'pelaksana': []
        }

    def _extract_admin_data(self, root):
        """Extract admin data with safe defaults"""
        try:
            return {
                'certificate': root.findtext('.//dcc:uniqueIdentifier', namespaces=XML_NS) or '',
                'order': root.findtext('.//dcc:identification[@refType="basic_orderNumber"]/dcc:value', namespaces=XML_NS) or '',
                'tempat': root.findtext('.//dcc:performanceLocation', namespaces=XML_NS) or ''
            }
        except Exception as e:
            logger.error(f"Error extracting admin data: {e}")
            return {'certificate': '', 'order': '', 'tempat': ''}

    def _extract_timeline(self, root): 
        """Extract timeline data with safe defaults"""
        try:
            return {
                'tgl_mulai': root.findtext('.//dcc:beginPerformanceDate', namespaces=XML_NS) or '',
                'tgl_akhir': root.findtext('.//dcc:endPerformanceDate', namespaces=XML_NS) or '',
                'tgl_pengesahan': root.findtext('.//dcc:issueDate', namespaces=XML_NS) or ''
            }
        except Exception as e:
            logger.error(f"Error extracting timeline: {e}")
            return {'tgl_mulai': '', 'tgl_akhir': '', 'tgl_pengesahan': ''}
    
    def _extract_objects(self, root):
        """Extract objects with safe defaults"""
        objects = []
        try:
            for obj in root.findall('.//dcc:items/dcc:item', namespaces=XML_NS):
                jenis_elem = obj.find('.//dcc:name', namespaces=XML_NS)
                merek = obj.findtext('.//dcc:manufacturer/dcc:name/dcc:content', namespaces=XML_NS) or "-"
                tipe = obj.findtext('.//dcc:model', namespaces=XML_NS) or "-"
                seri = obj.findtext('.//dcc:identifications/dcc:identification[@refType="basic_serialNumber"]/dcc:value', namespaces=XML_NS) or "-"
                id_lain_elem = obj.find('.//dcc:identifications/dcc:identification[@refType="basic_serialNumber"]/dcc:name', namespaces=XML_NS)

                # Ensure always dictionary
                jenis = self._get_multilang_text(jenis_elem)
                id_lain = self._get_multilang_text(id_lain_elem)

                objects.append({
                    'jenis': jenis,
                    'merek': merek,
                    'tipe': tipe,
                    'seri_item': seri,
                    'id_lain': id_lain
                })
        except Exception as e:
            logger.error(f"Error extracting objects: {e}")
        
        return objects

    def _extract_responsible_persons(self, root):
        """Extract responsible persons with safe defaults"""
        roles = {
            'pelaksana': [],
            'penyelia': [],
            'kepala': {},
            'direktur': {}
        }
        
        try:
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
        except Exception as e:
            logger.error(f"Error extracting responsible persons: {e}")

        return roles
    
    def _extract_owner(self, root):
        """Extract owner data with safe defaults"""
        try:
            owner_location = root.find('.//dcc:customer/dcc:location', namespaces=XML_NS)
            if owner_location is None:
                return {
                    'nama_cust': root.findtext('.//dcc:customer/dcc:name/dcc:content', namespaces=XML_NS) or '',
                    'jalan_cust': '', 'no_jalan_cust': '', 'kota_cust': '', 
                    'state_cust': '', 'pos_cust': '', 'negara_cust': ''
                }
            
            return {
                'nama_cust': root.findtext('.//dcc:customer/dcc:name/dcc:content', namespaces=XML_NS) or '',
                'jalan_cust': owner_location.findtext('.//dcc:street', namespaces=XML_NS) or '',
                'no_jalan_cust': owner_location.findtext('.//dcc:streetNo', namespaces=XML_NS) or '',
                'kota_cust': owner_location.findtext('.//dcc:city', namespaces=XML_NS) or '',
                'state_cust': owner_location.findtext('.//dcc:state', namespaces=XML_NS) or '',
                'pos_cust': owner_location.findtext('.//dcc:postCode', namespaces=XML_NS) or '',
                'negara_cust': root.findtext('.//dcc:customer/dcc:countryCode', namespaces=XML_NS) or ''
            }
        except Exception as e:
            logger.error(f"Error extracting owner: {e}")
            return {
                'nama_cust': '', 'jalan_cust': '', 'no_jalan_cust': '', 'kota_cust': '', 
                'state_cust': '', 'pos_cust': '', 'negara_cust': ''
            }
    
    def _extract_equipments(self, root):
        """Extract equipments with safe defaults"""
        equipments = []
        try:
            for eq in root.findall('.//dcc:measurementResults/dcc:measurementResult/dcc:measuringEquipments/dcc:measuringEquipment', namespaces=XML_NS):
                nama_alat_elem = eq.find('.//dcc:name', namespaces=XML_NS)
                manuf_model_elem = eq.find('.//dcc:identifications/dcc:identification[@refType="basic_serialNumber"]/dcc:name', namespaces=XML_NS)
                model = eq.findtext('.//dcc:manufacturer/dcc:name/dcc:content', namespaces=XML_NS) or '-'
                seri = eq.findtext('.//dcc:identifications/dcc:identification[@refType="basic_serialNumber"]/dcc:value', namespaces=XML_NS) or '-'

                nama_alat = self._get_multilang_text(nama_alat_elem)
                manuf_model = self._get_multilang_text(manuf_model_elem)

                equipments.append({
                    'nama_alat': nama_alat,
                    'manuf_model': manuf_model,
                    'model': model,
                    'seri_measuring': seri
                })
        except Exception as e:
            logger.error(f"Error extracting equipments: {e}")
        
        return equipments
    
    def _extract_conditions(self, root):
        """Extract conditions with safe defaults"""
        conditions = []
        try:
            for cond in root.findall('.//dcc:influenceConditions/dcc:influenceCondition', namespaces=XML_NS):
                jenis_kondisi_elem = cond.find('.//dcc:name', namespaces=XML_NS)
                tengah = cond.findtext('.//dcc:quantity[@refType="math_minimum"]/si:real/si:value', namespaces=XML_NS) or ''
                tengah_unit = cond.findtext('.//dcc:quantity[@refType="math_minimum"]/si:real/si:unit', namespaces=XML_NS) or ''
                rentang = cond.findtext('.//dcc:quantity[@refType="math_maximum"]/si:real/si:value', namespaces=XML_NS) or ''
                rentang_unit = cond.findtext('.//dcc:quantity[@refType="math_maximum"]/si:real/si:unit', namespaces=XML_NS) or ''

                jenis_kondisi = self._get_multilang_text(jenis_kondisi_elem)

                conditions.append({
                    'jenis_kondisi': jenis_kondisi,
                    'tengah': tengah,
                    'tengah_unit': tengah_unit,
                    'rentang': rentang,
                    'rentang_unit': rentang_unit
                })
        except Exception as e:
            logger.error(f"Error extracting conditions: {e}")
        
        return conditions
    
    def _extract_methods(self, root):
        """Extract methods with safe defaults"""
        methods = []
        try:
            for met in root.findall('.//dcc:measurementResults/dcc:measurementResult/dcc:usedMethods/dcc:usedMethod', namespaces=XML_NS):
                method_name_elem = met.find('.//dcc:name', namespaces=XML_NS)
                method_desc_elem = met.find('.//dcc:description', namespaces=XML_NS)

                method_name = self._get_multilang_text(method_name_elem)
                method_desc = self._get_multilang_text(method_desc_elem)

                methods.append({
                    'method_name': method_name,
                    'method_desc': method_desc
                })
        except Exception as e:
            logger.error(f"Error extracting methods: {e}")
        
        return methods
    
    def _extract_statements(self, root):
        """Extract statements with safe defaults"""
        statements = []
        try:
            for stmt in root.findall('.//dcc:statements/dcc:statement', namespaces=XML_NS):
                declaration_elem = stmt.find('.//dcc:declaration', namespaces=XML_NS)
                declaration = self._get_multilang_text(declaration_elem)
                
                statements.append({
                    'value': declaration
                })
        except Exception as e:
            logger.error(f"Error extracting statements: {e}")
        
        return statements

    def _extract_uncertainty(self, root):
        """Extract uncertainty with safe defaults"""
        try:
            uncert = root.find('.//dcc:measurementUncertainty', namespaces=XML_NS)
            if uncert is None:
                return {'probability': '', 'factor': ''}
            
            return {
                'probability': uncert.findtext('.//dcc:coverageProbability', namespaces=XML_NS) or '',
                'factor': uncert.findtext('.//dcc:coverageFactor', namespaces=XML_NS) or ''
            }
        except Exception as e:
            logger.error(f"Error extracting uncertainty: {e}")
            return {'probability': '', 'factor': ''}
    
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

    def generate_pdf(self, xml_content, output_path):
        """Generate PDF dari konten XML"""
        try:
            # Validate template exists
            if not os.path.exists(self.template_path):
                logger.error(f"Template file not found at {self.template_path}")
                return False
            
            # Ekstrak data dari XML
            data = self.extract_data_from_xml(xml_content)
            
            # Debug: Log the extracted data structure 
            logger.info("Extracted data structure:")
            for key, value in data.items():
                logger.info(f"  {key}: {type(value)} - {len(value) if isinstance(value, (list, dict)) else 'N/A'}")
            
            # Render template HTML
            with open(self.template_path, 'r', encoding='utf-8') as f:
                template_html = f.read()
            
            template = Template(template_html)
            rendered_html = template.render(**data)
            
            # Generate PDF/A-3
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
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return False
        
if __name__ == "__main__":
    # Test with minimal XML
    test_xml = """<?xml version="1.0" encoding="UTF-8"?>
    <dcc:digitalCalibrationCertificate xmlns:dcc="https://ptb.de/dcc" xmlns:si="https://ptb.de/si">
        <dcc:administrativeData>
            <dcc:coreData>
                <dcc:uniqueIdentifier>TEST-001</dcc:uniqueIdentifier>
                <dcc:performanceLocation>Test Location</dcc:performanceLocation>
            </dcc:coreData>
        </dcc:administrativeData>
    </dcc:digitalCalibrationCertificate>"""
    
    generator = PDFGenerator()
    success = generator.generate_pdf(test_xml, "test.pdf")
    print(f"PDF generation {'successful' if success else 'failed'}")