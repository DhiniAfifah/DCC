from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side
import xml.etree.ElementTree as ET
import os
from api.ds_i_utils import d_si
from api.ds_i_utils import convert_unit



# Function to handle None values in XML parsing
def gt(el):
    return el.text if el is not None and el.text is not None else "-"

# Border style for table cells
border = Border(
    left=Side(border_style='thin', color='000000'),
    right=Side(border_style='thin', color='000000'),
    top=Side(border_style='thin', color='000000'),
    bottom=Side(border_style='thin', color='000000')
)

# Function to apply border to cells in a given range
def apply_borders(ws, start_row, end_row, start_col, end_col):
    for row in ws.iter_rows(min_row=start_row, max_row=end_row, min_col=start_col, max_col=end_col):
        for cell in row:
            cell.border = border

# Utility function to create Excel table headers
def create_table_header(ws, row, headers):
    col = 1
    for header in headers:
        ws.cell(row=row, column=col, value=header).font = Font(bold=True)
        ws.cell(row=row, column=col).alignment = Alignment(horizontal='center')
        col += 1
    return row + 1

# Function to convert XML to Excel
def convert_xml_to_excel(xml_file_path: str):
    try:
        
        
        # Load XML using ElementTree
        tree = ET.parse(xml_file_path)
        root = tree.getroot()

        # Initialize Excel workbook
        wb = Workbook()
        ws = wb.active
        row = 1

        ns = {  # XML namespaces
            'dcc': 'https://ptb.de/dcc',
            'si': 'https://ptb.de/si'
        }

        # SOFTWARE
        software = root.find('.//dcc:software', ns)
        software_name = gt(software.find('dcc:name/dcc:content', ns)) if software else "N/A"
        version = gt(software.find('dcc:release', ns))

        ws.cell(row=row, column=1, value="Perangkat Lunak").font = Font(bold=True, size=14)
        row += 2
        ws.cell(row=row, column=1, value="Nama")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=software_name)
        row += 2
        ws.cell(row=row, column=1, value="Versi")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=version)
        row += 2

        # ADMINISTRATIVE DATA
        administrasi = root.find('.//dcc:coreData', ns)
        country_calib = gt(administrasi.find('dcc:countryCodeISO3166_1', ns))
        place = gt(administrasi.find('dcc:performanceLocation', ns))
        #bahasa
        langs = administrasi.findall('dcc:usedLangCodeISO639_1', ns)
        used_lang = ', '.join(lang.text for lang in langs if lang is not None and lang.text)
        mandatory_langs = administrasi.findall('dcc:mandatoryLangCodeISO639_1', ns)
        mandatory_lang = ', '.join(lang.text for lang in mandatory_langs if lang is not None and lang.text)
        
        order = gt(administrasi.find('dcc:identifications/dcc:identification/dcc:value', ns))
        order_issuer = gt(administrasi.find('dcc:identifications/dcc:identification/dcc:issuer', ns))
        sertifikat = gt(administrasi.find('dcc:uniqueIdentifier', ns))

        ws.cell(row=row, column=1, value="Data Administrasi").font = Font(bold=True, size=14)
        row += 2
        ws.cell(row=row, column=1, value="Negara tempat kalibrasi")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=country_calib)
        row += 2
        ws.cell(row=row, column=1, value="Tempat kalibrasi")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=place)
        row += 2
        ws.cell(row=row, column=1, value="Bahasa yang digunakan")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=used_lang)
        row += 2
        ws.cell(row=row, column=1, value="Bahasa yang diwajibkan")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=mandatory_lang)
        row += 2
        ws.cell(row=row, column=1, value="Nomor order")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=order)
        row += 2
        ws.cell(row=row, column=1, value="Penerbit nomor order")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=order_issuer)
        row += 2
        ws.cell(row=row, column=1, value="Nomor sertifikat")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=sertifikat)
        row += 2


        # TIMELINE
        begin_date = gt(administrasi.find('dcc:beginPerformanceDate', ns))
        end_date = gt(administrasi.find('dcc:endPerformanceDate', ns))
        issue_date = gt(administrasi.find('dcc:issueDate', ns))

        ws.cell(row=row, column=1, value="Linimasa Pengukuran").font = Font(bold=True, size=14)
        row += 2
        ws.cell(row=row, column=1, value="Tanggal mulai pengukuran")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=begin_date)
        row += 2
        ws.cell(row=row, column=1, value="Tanggal akhir pengukuran")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=end_date)
        row += 2
        ws.cell(row=row, column=1, value="Tanggal pengesahan")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=issue_date)
        row += 2
        
        
        #OBJECTS
        objects = root.findall('.//dcc:items/dcc:item', ns)
        ws.cell(row=row, column=1, value="Deskripsi Objek yang Dikalibrasi/Diukur").font = Font(bold=True, size=14)
        row += 2

        # Iterate over each object
        for i, objek in enumerate(objects, start=1):
            
            jenis_elements = objek.findall('dcc:name/dcc:content', ns)
            jenis = ', '.join([gt(jenis_element) for jenis_element in jenis_elements if jenis_elements])

            merek = gt(objek.find('.//dcc:manufacturer/dcc:name/dcc:content', ns))
            tipe = gt(objek.find('.//dcc:model', ns))
            seri_issuer = gt(objek.find('.//dcc:identifications/dcc:identification/dcc:issuer', ns))
            seri_objek = gt(objek.find('.//dcc:identifications/dcc:identification/dcc:value', ns))

            id_lain_elements = objek.findall('.//dcc:identifications/dcc:identification/dcc:name/dcc:content', ns)
            id_lain = ', '.join([gt(id_lain_element) for id_lain_element in id_lain_elements if id_lain_element.text is not None])

            ws.cell(row=row, column=1, value=f"Objek {i}").font = Font(bold=True, size=12)
            row += 2
            ws.cell(row=row, column=1, value="Jenis alat atau objek")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=jenis)
            row += 2
            ws.cell(row=row, column=1, value="Merek/pembuat")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=merek)
            row += 2
            ws.cell(row=row, column=1, value="Tipe")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=tipe)
            row += 2
            ws.cell(row=row, column=1, value="Identifikasi alat").font = Font(bold=True)
            row += 2
            ws.cell(row=row, column=1, value="Penerbit nomor seri")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=seri_issuer)
            row += 2
            ws.cell(row=row, column=1, value="Nomor seri")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=seri_objek)
            row += 2
            ws.cell(row=row, column=1, value="Identifikasi lain")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=id_lain)
            row += 2

        #INFO LAB
        lab = root.find('.//dcc:calibrationLaboratory', ns)
        
        kode = gt(lab.find('dcc:calibrationLaboratoryCode', ns))
        nama_lab = gt(lab.find('dcc:contact/dcc:name/dcc:content', ns))
        email = gt(lab.find('dcc:contact/dcc:eMail', ns))
        telp = gt(lab.find('dcc:contact/dcc:phone', ns))
        link = gt(lab.find('dcc:contact/dcc:link', ns))
        jalan_lab = gt(lab.find('dcc:contact/dcc:location/dcc:street', ns))
        no_jalan_lab = gt(lab.find('dcc:contact/dcc:location/dcc:streetNo', ns))
        city_lab = gt(lab.find('dcc:contact/dcc:location/dcc:city', ns))
        state_lab = gt(lab.find('dcc:contact/dcc:location/dcc:state', ns))
        pos_lab = gt(lab.find('dcc:contact/dcc:location/dcc:postCode', ns))
        negara_lab = gt(lab.find('dcc:contact/dcc:location/dcc:countryCode', ns))

        ws.cell(row=row, column=1, value="Informasi Laboratorium Kalibrasi").font = Font(bold=True, size=14)
        row += 2
        ws.cell(row=row, column=1, value="Negara tempat kalibrasi")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=negara_lab)
        row += 2
        ws.cell(row=row, column=1, value="Kode")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=kode)
        row += 2
        ws.cell(row=row, column=1, value="Nama lab")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=nama_lab)
        row += 2
        ws.cell(row=row, column=1, value="E-mail")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=email)
        row += 2
        ws.cell(row=row, column=1, value="Nomor telepon")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=telp)
        row += 2
        ws.cell(row=row, column=1, value="Link website")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=link)
        row += 2
        ws.cell(row=row, column=1, value="Alamat").font = Font(bold=True)
        row += 2
        ws.cell(row=row, column=1, value="Jalan")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=jalan_lab)
        row += 2
        ws.cell(row=row, column=1, value="Nomor jalan")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=no_jalan_lab)
        row += 2
        ws.cell(row=row, column=1, value="Kecamatan/kabupaten/kota")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=city_lab)
        row += 2
        ws.cell(row=row, column=1, value="Provinsi")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=state_lab)
        row += 2
        ws.cell(row=row, column=1, value="Kode pos")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=pos_lab)
        row += 2
        ws.cell(row=row, column=1, value="Negara")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=negara_lab)
        row += 2

        #PENANGGUNG JAWAB
        resp = root.find('.//dcc:respPersons', ns)

        # Mengambil data penanggung jawab
        for person in resp.findall('dcc:respPerson', ns):
            # Ambil nama penanggung jawab
            nama_resp = person.find('dcc:person/dcc:name/dcc:content', ns).text if person.find('dcc:person/dcc:name/dcc:content', ns) is not None else 'N/A'
            nip_resp = person.find('dcc:description/dcc:content', ns).text if person.find('dcc:description/dcc:content', ns) is not None else 'N/A'
            
            # Ambil role jika ada, jika tidak, gunakan fallback
            role_element = person.find('dcc:role', ns)
            role = role_element.text if role_element is not None else 'N/A'
            
            # Cek apakah penanggung jawab utama atau bukan
            main_signer = person.find('dcc:mainSigner', ns)
            if main_signer is not None and main_signer.text == "true":
                role = "Direktur"
            
            # Menulis data ke Excel
            ws.cell(row=row, column=1, value=role).font = Font(bold=True)
            row += 2
            ws.cell(row=row, column=1, value="Nama")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=nama_resp)
            row += 2
            ws.cell(row=row, column=1, value="NIP")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=nip_resp)
            row += 2


        # OWNER INFO
        owner = root.find('.//dcc:customer', ns)

        nama_cust = gt(owner.find('dcc:name/dcc:content', ns))
        jalan_cust = gt(owner.find('dcc:location/dcc:street', ns))
        no_jalan_cust = gt(owner.find('dcc:location/dcc:streetNo', ns))
        city_cust = gt(owner.find('dcc:location/dcc:city', ns))
        state_cust = gt(owner.find('dcc:location/dcc:state', ns))
        pos_cust = gt(owner.find('dcc:location/dcc:postCode', ns))
        negara_cust = gt(owner.find('dcc:location/dcc:countryCode', ns))

        # Write owner (Pemilik Objek) data to Excel
        ws.cell(row=row, column=1, value="Identitas Pemilik Objek yang Dikalibrasi/Diukur").font = Font(bold=True, size=14)
        row += 2
        ws.cell(row=row, column=1, value="Nama")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=nama_cust)
        row += 2
        ws.cell(row=row, column=1, value="Alamat").font = Font(bold=True)
        row += 2
        ws.cell(row=row, column=1, value="Jalan")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=jalan_cust)
        row += 2
        ws.cell(row=row, column=1, value="Nomor jalan")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=no_jalan_cust)
        row += 2
        ws.cell(row=row, column=1, value="Kecamatan/kabupaten/kota")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=city_cust)
        row += 2
        ws.cell(row=row, column=1, value="Provinsi")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=state_cust)
        row += 2
        ws.cell(row=row, column=1, value="Kode pos")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=pos_cust)
        row += 2
        ws.cell(row=row, column=1, value="Negara")
        ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
        ws.cell(row=row, column=5, value=negara_cust)
        row += 2
        
        # Metode Kalibrasi
        methods = root.findall('.//dcc:measurementResults/dcc:measurementResult/dcc:usedMethods/dcc:usedMethod', ns)
        ws.cell(row=row, column=1, value="Metode Kalibrasi").font = Font(bold=True, size=14)
        row += 2

        # Assuming methods are provided as a list, iterate over each method
        for i, method in enumerate(methods, start=1):
            
            method_name_elements = method.findall('dcc:name/dcc:content', ns)
            method_name = ', '.join([gt(method_name_element) for method_name_element in method_name_elements if method_name_element.text])

            method_desc_elements = method.findall('dcc:description/dcc:content', ns)
            method_desc = ', '.join([gt(method_desc_element) for method_desc_element in method_desc_elements if method_desc_element.text])

            # Extract norm (standard) for the method
            norm = gt(method.find('dcc:norm', ns))

            # Write method details to Excel
            ws.cell(row=row, column=1, value=f"Metode {i}").font = Font(bold=True, size=12)
            row += 2
            ws.cell(row=row, column=1, value="Nama")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=method_name)
            row += 2
            ws.cell(row=row, column=1, value="Norma")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=norm)
            row += 2
            ws.cell(row=row, column=1, value="Deskripsi")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=method_desc)
            row += 2
            ws.cell(row=row, column=1, value="Rumus")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value="-")
            row += 2
            ws.cell(row=row, column=1, value="Gambar")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            
            ## Check if the method has an image and write the visual data
            #if method.has_image and method.image:
                # Only include image visual data, excluding file name, mimeType, base64
             #   ws.cell(row=row + 2, column=1, value="Image: Present")
              #  row += 4  # Skip the next 4 rows since the image is present
            #else:
             #   # If no image is present, mark as no image
              ## row += 4

            #ws.cell(row=row, column=1, value="Keterangan gambar")
            #ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            #s.cell(row=row, column=5, value="-")
            #row += 2

        # Standar atau Alat Pengukuran
        equipments = root.findall('.//dcc:measuringEquipments/dcc:measuringEquipment', ns)
        ws.cell(row=row, column=1, value="Standar atau Alat Pengukuran").font = Font(bold=True, size=14)
        row += 2

        # Iterate through each equipment (measuring equipment)
        for i, equip in enumerate(equipments, start=1):
            # Handle 'nama_alat' (equipment name) in multiple languages
            nama_alat_elements = equip.findall('dcc:name/dcc:content', ns)
            nama_alat = ', '.join([gt(nama_alat_element) for nama_alat_element in nama_alat_elements if nama_alat_element.text])

            # Handle 'model' (manufacturer model) in multiple languages
            manuf_model_elements = equip.findall('dcc:manufacturer/dcc:name/dcc:content', ns)
            model = ', '.join([gt(manuf_model_element) for manuf_model_element in manuf_model_elements if manuf_model_element.text])

            # Extract serial number (seri_measuring)
            seri_measuring = gt(equip.find('dcc:identifications/dcc:identification/dcc:value', ns))

            # Handle 'manuf_model' (manufacturer model in identification) in multiple languages
            manuf_model_id_elements = equip.findall('dcc:identifications/dcc:identification/dcc:name/dcc:content', ns)
            manuf_model = ', '.join([gt(manuf_model_id_element) for manuf_model_id_element in manuf_model_id_elements if manuf_model_id_element.text])

            # Write equipment details to Excel
            ws.cell(row=row, column=1, value=f"Alat {i}").font = Font(bold=True, size=12)
            row += 2
            ws.cell(row=row, column=1, value="Nama")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=nama_alat)
            row += 2
            ws.cell(row=row, column=1, value="Merek dan model")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=model)
            row += 2
            ws.cell(row=row, column=1, value="Nomor seri")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=seri_measuring)
            row += 2
            ws.cell(row=row, column=1, value="Merek dan model dalam identifikasi")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=manuf_model)
            row += 2

        # Kondisi Lingkungan
        conditions = root.findall('.//dcc:influenceConditions/dcc:influenceCondition', ns)
        ws.cell(row=row, column=1, value="Kondisi Lingkungan").font = Font(bold=True, size=14)
        row += 2

        # Iterate over each condition (e.g., temperature, humidity, or both)
        for i, kondisi in enumerate(conditions, start=1):
            # Extract the condition name (e.g., temperature or humidity) in multiple languages
            parameter_elements = kondisi.findall('dcc:name/dcc:content', ns)
            parameter = ', '.join([gt(parameter_element) for parameter_element in parameter_elements if parameter_element.text])

            # Extract the condition description in multiple languages
            kondisi_desc_elements = kondisi.findall('dcc:description/dcc:content', ns)
            kondisi_desc = ', '.join([gt(kondisi_desc_element) for kondisi_desc_element in kondisi_desc_elements if kondisi_desc_element.text])

            # Write the condition name and description to Excel
            ws.cell(row=row, column=1, value=f"Parameter {i}").font = Font(bold=True, size=12)
            row += 2
            ws.cell(row=row, column=1, value="Parameter lingkungan")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=parameter)
            row += 2
            ws.cell(row=row, column=1, value="Deskripsi")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value=kondisi_desc)
            row += 2

            # Extracting variables (values) for this condition
            variables = kondisi.findall('dcc:data/dcc:quantity', ns)
            for var in variables:
                # Extract the variable name (e.g., "minimum", "maximum", etc.)
                variabel = gt(var.find('dcc:name/dcc:content', ns))
                # Extract the value of the variable (e.g., temperature or humidity value)
                kondisi_value = gt(var.find('si:real/si:value', ns))
                # Extract the unit for the variable (e.g., °C, %)
                kondisi_unit = gt(var.find('si:real/si:unit', ns))

                # Convert unit to a more readable form
                kondisi_unit_converted = convert_unit(kondisi_unit)

                # Write the variable details (value and unit) to Excel
                ws.cell(row=row, column=1, value=variabel)
                ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
                ws.cell(row=row, column=5, value=kondisi_value)
                ws.cell(row=row, column=6, value=kondisi_unit_converted)
                row += 2
 

        # Hasil Kalibrasi
        ws.cell(row=row, column=1, value="Hasil Kalibrasi").font = Font(bold=True, size=14)
        row += 2

        results = root.findall('.//dcc:results/dcc:result', ns)

        # Iterate over each result
        for hasil in results:
            quantities = hasil.findall('dcc:data/dcc:list/dcc:quantity', ns)
            quantity_names = [q.find('dcc:name/dcc:content[@lang="en"]', ns).text if q.find('dcc:name/dcc:content[@lang="en"]', ns) is not None else "No Name" for q in quantities]

            all_quantity_data = []
            max_rows = 0

            # Process each quantity (e.g., minimum, maximum, etc.)
            for q in quantities:
                hybrid = q.find('si:hybrid', ns)
                quantity_data = []

                if hybrid is not None:
                    real_lists = hybrid.findall('si:realListXMLList', ns)
                    for rl in real_lists:
                        value_elem = rl.find('si:valueXMLList', ns)
                        unit_elem = rl.find('si:unitXMLList', ns)

                        values = value_elem.text.strip().split() if value_elem is not None else []
                        units = unit_elem.text.strip().split() if unit_elem is not None else []

                        # Handle the case where there's only one unit for all values
                        if len(units) == 1:
                            unit = units[0]
                            quantity_data.append([(v, convert_unit(unit)) for v in values])
                        else:
                            quantity_data.append([(v, convert_unit(unit)) for v, unit in zip(values, units)])

                else:
                    real_lists = q.findall('si:realListXMLList', ns)
                    for rl in real_lists:
                        value_elem = rl.find('si:valueXMLList', ns)
                        unit_elem = rl.find('si:unitXMLList', ns)

                        values = value_elem.text.strip().split() if value_elem is not None else []
                        units = unit_elem.text.strip().split() if unit_elem is not None else []

                        # Handle the case where there's only one unit for all values
                        if len(units) == 1:
                            unit = units[0]
                            quantity_data.append([(v, convert_unit(unit)) for v in values])
                        else:
                            quantity_data.append([(v, convert_unit(unit)) for v, unit in zip(values, units)])

                all_quantity_data.append(quantity_data)
                if quantity_data:
                    max_rows = max(max_rows, len(quantity_data[0]))

            total_columns = sum(len(q_data) * 2 for q_data in all_quantity_data)
            title = hasil.find('dcc:name/dcc:content[@lang="en"]', ns).text if hasil.find('dcc:name/dcc:content[@lang="en"]', ns) is not None else "No Title"

            # Write the title and create merged cells for the table header
            ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=total_columns)
            table_name = ws.cell(row=row, column=1, value=title)
            table_name.font = Font(bold=True)
            apply_borders(ws, row, row, 1, total_columns)
            row += 1

            col = 1
            header_range = []

            # Writing header for the quantities
            for q_name, q_data in zip(quantity_names, all_quantity_data):
                span = len(q_data)
                header_cell = ws.cell(row=row, column=col, value=q_name)
                header_cell.font = Font(bold=True)
                header_cell.alignment = Alignment(horizontal="center")
                header_range.append((col, col + span * 2 - 1))
                col += span * 2

            for start_col, end_col in header_range:
                if start_col > end_col:  # Ensure start_col is less than end_col
                    start_col, end_col = end_col, start_col
                ws.merge_cells(start_row=row, start_column=start_col, end_row=row, end_column=end_col)

            apply_borders(ws, row, row, 1, total_columns)
            row += 1

            # Writing the quantity values (including unit conversion) to the Excel sheet
            for i in range(max_rows):
                col = 1
                for q_data in all_quantity_data:
                    for pair_set in q_data:
                        if i < len(pair_set):
                            val, unit = pair_set[i]
                            # Write the value and unit to Excel
                            ws.cell(row=row, column=col, value=round(float(val), 5) if val else "")
                            ws.cell(row=row, column=col + 1, value=unit)
                        col += 2
                row += 1

            apply_borders(ws, row - max_rows, row - 1, 1, total_columns)
            row += 1




        # Pernyataan
        statements = root.findall('.//dcc:statements/dcc:statement', ns)
        ws.cell(row=row, column=1, value="Pernyataan").font = Font(bold=True, size=14)
        row += 2

        # Iterate over each statement in the 'statements' list
        for i, pernyataan in enumerate(statements, start=1):
            # Extract all available language content for the statement
            statement_elements = pernyataan.findall('dcc:declaration/dcc:content', ns)
            statement_text = ', '.join([gt(statement_element) for statement_element in statement_elements if statement_element.text])

            # Write statement title
            ws.cell(row=row, column=1, value=f"Pernyataan {i}").font = Font(bold=True, size=12)
            row += 1

            # Write the statement content in multiple languages
            ws.cell(row=row, column=1, value=statement_text)
            row += 2
            # Write the formula placeholder
            ws.cell(row=row, column=1, value="Rumus")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row, column=5, value="-")
            row += 2
            # Write the Gambar
            ws.cell(row=row, column=1, value="Gambar")
            ws.cell(row=row, column=4, value=":").alignment = Alignment(horizontal='center')
            ws.cell(row=row+2, column=1, value="-")  # Placeholder for the image (visual representation)
            row += 4

        # Save the Excel file
        excel_filename = os.path.basename(xml_file_path) + ".xlsx"
        excel_path = os.path.join(os.path.dirname(xml_file_path), excel_filename)
        wb.save(excel_path)

        return excel_path

    except Exception as e:
        raise Exception(f"Error converting XML to Excel: {str(e)}")
