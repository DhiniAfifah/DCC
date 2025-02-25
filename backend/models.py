from sqlalchemy import Column, Integer, String
from database import Base

class DCCForm(Base):
    __tablename__ = "dcc_forms"

    id = Column(Integer, primary_key=True, index=True)
    software_name = Column(String)
    software_version = Column(String)
    issuer = Column(String)
    country = Column(String)
    certificate_number = Column(String)
    order_number = Column(String)
    measurement_start = Column(String)
    measurement_end = Column(String)
    calibration_place = Column(String)
    approval_date = Column(String)
    # Kolom lainnya sesuai dengan data yang kamu terima dari formulir
