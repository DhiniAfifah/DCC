from sqlalchemy import Column, Integer, String
from database import Base

class DCCForm(Base):
    __tablename__ = "dcc_forms"

    id = Column(Integer, primary_key=True, index=True)
    software = Column(String)
    version = Column(String)
    core_issuer = Column(String)
    country_code = Column(String)
    sertifikat = Column(String)
    order = Column(String)
    tgl_mulai = Column(String)
    tgl_akhir = Column(String)
    tempat = Column(String)
    tgl_pengesahan = Column(String)
    # Kolom lainnya sesuai dengan data yang kamu terima dari formulir
