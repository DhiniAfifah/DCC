from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class DCC(Base):
    __tablename__ = 'dcc'
    
    id = Column(Integer, primary_key=True, index=True)
    software = Column(String, nullable=False)
    version = Column(String, nullable=False)
    sertifikat = Column(String, nullable=False)
    order_number = Column(String, nullable=False)
    methods = Column(String, nullable=False)
    equipments = Column(String, nullable=False)
    conditions = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    tgl_mulai = Column(String)
    tgl_akhir = Column(String)
    tgl_pengesahan = Column(String)
    tempat = Column(String)
    statements = Column(String)
    owner = Column(String)
    responsible_person = Column(String)

    methods_rel = relationship("Method", back_populates="dcc")
    equipments_rel = relationship("Equipment", back_populates="dcc")
    conditions_rel = relationship("Condition", back_populates="dcc")


class Method(Base):
    __tablename__ = 'methods'
    
    id = Column(Integer, primary_key=True, index=True)
    dcc_id = Column(Integer, ForeignKey('dcc.id'))
    method_name = Column(String, nullable=False)
    norm = Column(String, nullable=False)
    method_desc = Column(String, nullable=False)

    dcc = relationship("DCC", back_populates="methods_rel")


class Equipment(Base):
    __tablename__ = 'equipments'
    
    id = Column(Integer, primary_key=True, index=True)
    dcc_id = Column(Integer, ForeignKey('dcc.id'))
    nama_alat = Column(String, nullable=False)
    manuf_model = Column(String, nullable=False)
    seri_measuring = Column(String, nullable=False)

    dcc = relationship("DCC", back_populates="equipments_rel")


class Condition(Base):
    __tablename__ = 'conditions'
    
    id = Column(Integer, primary_key=True, index=True)
    dcc_id = Column(Integer, ForeignKey('dcc.id'))
    kondisi = Column(String, nullable=False)
    kondisi_desc = Column(String, nullable=False)
    tengah_value = Column(String, nullable=False)
    tengah_unit = Column(String, nullable=False)
    rentang_value = Column(String, nullable=False)
    rentang_unit = Column(String, nullable=False)

    dcc = relationship("DCC", back_populates="conditions_rel")
