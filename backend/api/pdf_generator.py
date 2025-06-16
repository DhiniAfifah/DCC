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
            return False
        
        self.temp_dir = tempfile.TemporaryDirectory()
        logger.info(f"Using temporary directory: {self.temp_dir.name}")
    
    #FUNGSI MULTI LANG
    def _get_multilang_text(self, element):
        """Ekstrak teks multi-bahasa dari elemen XML"""
        if element is None or len(element) == 0:
            return {}
        
        texts = {}
        for content_elem in element.findall('.//dcc:content', namespaces=XML_NS):
            lang = content_elem.get('lang', 'id')
            texts[lang] = content_elem.text.strip() if content_elem.text else ""
        return texts

    def __del__(self):
        self.temp_dir.cleanup()

    def extract_data_from_xml(self, xml_content):
        """Ekstrak data dari XML ke struktur Python"""
        root = ET.fromstring(xml_content)
        data = {
            'admin': self._extract_admin_data(root) or {},
            'Measurement_TimeLine': self._extract_timeline(root) or {},
            'objects': self._extract_objects(root) or [],
            'responsible_persons': self._extract_responsible_persons(root) or {
                'pelaksana': [], 'penyelia': [], 'kepala': {}, 'direktur': {}
            },
            'owner': self._extract_owner(root) or {},
            'methods': self._extract_methods(root) or [],
            'equipments': self._extract_equipments(root) or [],
            'conditions': self._extract_conditions(root) or [],
            'uncertainty': self._extract_uncertainty(root) or {
                'probability': '', 'factor': ''
            },
            'statements': self._extract_statements(root) or [],
            'kepala': self._extract_responsible_persons(root).get('kepala', {}),
            'penyelia': self._extract_responsible_persons(root).get('penyelia', []),
            'pelaksana': self._extract_responsible_persons(root).get('pelaksana', [])
        }

        return data
        

    #ADMIN
    def _extract_admin_data(self, root):
        return {
            'certificate': root.findtext('.//dcc:uniqueIdentifier', namespaces=XML_NS),
            'order': root.findtext('.//dcc:identification[@refType="basic_orderNumber"]/dcc:value', namespaces=XML_NS),
            'tempat': root.findtext('.//dcc:performanceLocation', namespaces=XML_NS)
        }

    # TIMELINE
    def _extract_timeline(self, root): 
        return {
            'tgl_mulai': root.findtext('.//dcc:beginPerformanceDate', namespaces=XML_NS),
            'tgl_akhir': root.findtext('.//dcc:endPerformanceDate', namespaces=XML_NS),
            'tgl_pengesahan': root.findtext('.//dcc:issueDate', namespaces=XML_NS)
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
                'nama_resp': resp.findtext('.//dcc:person/dcc:name/dcc:content', namespaces=XML_NS),
                'nip': resp.findtext('.//dcc:description/dcc:content', namespaces=XML_NS),
                'peran': resp.findtext('.//dcc:role', namespaces=XML_NS)
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

    
    #OWER
    def _extract_owner(self, root):
        owner = root.find('.//dcc:customer/dcc:location', namespaces=XML_NS)
        return {
            'nama_cust': root.findtext('.//dcc:customer/dcc:name/dcc:content', namespaces=XML_NS),
            'jalan_cust': owner.findtext('.//dcc:street', namespaces=XML_NS),
            'no_jalan_cust': owner.findtext('.//dcc:streetNo', namespaces=XML_NS),
            'kota_cust': owner.findtext('.//dcc:city', namespaces=XML_NS),
            'state_cust': owner.findtext('.//dcc:state', namespaces=XML_NS),
            'pos_cust': owner.findtext('.//dcc:postCode', namespaces=XML_NS),
            'negara_cust': root.findtext('.//dcc:customer/dcc:countryCode', namespaces=XML_NS)
        }
    
    #EQUIPMENT
    def _extract_equipments(self, root):
        equipments = []
        for eq in root.findall('.//dcc:measurementResults/dcc:measurementResult/dcc:measuringEquipments/dcc:measuringEquipment', namespaces=XML_NS):
            nama_alat = self._get_multilang_text(eq.find('.//dcc:name', namespaces=XML_NS))
            manuf_model = self._get_multilang_text(eq.find('.//dcc:identifications/dcc:identification[@refType="basic_serialNumber"]/dcc:name', namespaces=XML_NS))
            model = eq.findtext('.//dcc:manufacturer/dcc:name/dcc:content', namespaces=XML_NS) or '-'
            seri = eq.findtext('.//dcc:identifications/dcc:identification[@refType="basic_serialNumber"]/dcc:value', namespaces=XML_NS) or '-'

            # Pastikan tidak ada nilai None
            equipments.append({
                'nama_alat': nama_alat or {},
                'manuf_model': manuf_model or {},
                'model': model,
                'seri_measuring': seri
            })
        return equipments
    
    #CONDITIONS
    def _extract_conditions(self, root):
        conditions = []
        for cond in root.findall('.//dcc:influenceConditions/dcc:influenceCondition', namespaces=XML_NS):
            jenis_kondisi = self._get_multilang_text(cond.find('.//dcc:name', namespaces=XML_NS))
            tengah = cond.findtext('.//dcc:quantity[@refType="math_minimum"]/si:real/si:value', namespaces=XML_NS) or ''
            tengah_unit = cond.findtext('.//dcc:quantity[@refType="math_minimum"]/si:real/si:unit', namespaces=XML_NS) or ''
            rentang = cond.findtext('.//dcc:quantity[@refType="math_maximum"]/si:real/si:value', namespaces=XML_NS) or ''
            rentang_unit = cond.findtext('.//dcc:quantity[@refType="math_maximum"]/si:real/si:unit', namespaces=XML_NS) or ''

            conditions.append({
                'jenis_kondisi': jenis_kondisi or {},
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
                'method_name': method_name or {},
                'method_desc': method_desc or {}
            })
        return methods
    
    #STATEMENT
    def _extract_statements(self, root):
        statements = []
        for stmt in root.findall('.//dcc:statements/dcc:statement', namespaces=XML_NS):
            declaration = self._get_multilang_text(stmt.find('.//dcc:declaration', namespaces=XML_NS))
            statements.append({
                'value': declaration or {}
            })
        return statements

    # UNCERTAINTY
    def _extract_uncertainty(self, root):
        uncert = root.find('.//dcc:measurementUncertainty', namespaces=XML_NS)
        if uncert is None:
            return {
                'probability': '',
                'factor': ''
            }
        return {
            'probability': uncert.findtext('.//dcc:coverageProbability', namespaces=XML_NS) or '',
            'factor': uncert.findtext('.//dcc:coverageFactor', namespaces=XML_NS) or ''
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

    def generate_pdf(self, xml_content, output_path):
        """Generate PDF dari konten XML"""
        try:
            # Ekstrak data dari XML
            data = self.extract_data_from_xml(xml_content)
            
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
            return False
        
if __name__ == "__main__":
    generator = PDFGenerator()
    generator.generate_pdf("<dcc:digitalCalibrationCertificate>...</dcc:digitalCalibrationCertificate>", "test.pdf")