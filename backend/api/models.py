from sqlalchemy import Column, String, Integer, Date, Text
from api.database import Base

class DCC(Base):
    __tablename__ = "dcc"

    id = Column(Integer, primary_key=True, index=True)
    software_name = Column(String)
    software_version = Column(String)
    core_issuer = Column(String)
    used_languages = Column(Text)  # Simpan JSON dalam bentuk teks
    sertifikat_number = Column(String)
    tgl_mulai = Column(Date)
    tgl_akhir = Column(Date)
    tempat_kalibrasi = Column(String)
    country_code = Column(String)
    mandatory_languages = Column(Text)  # Simpan JSON dalam bentuk teks
    order_number = Column(String)
    tgl_pengesahan = Column(Date)
    
    objects_description = Column(Text)  # Simpan JSON dalam bentuk teks
    responsible_persons = Column(Text)  # Simpan JSON dalam bentuk teks
    owner = Column(Text)  # Simpan JSON dalam bentuk teks
    statements = Column(Text)  # Simpan JSON dalam bentuk teks
