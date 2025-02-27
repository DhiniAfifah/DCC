from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class DCCForm(Base):
    __tablename__ = "dcc_forms"

    id = Column(Integer, primary_key=True, index=True)
    software = Column(String, nullable=False)
    version = Column(String, nullable=False)
    core_issuer = Column(String, nullable=False)
    country_code = Column(String, nullable=False)
    sertifikat = Column(String, nullable=False)
    order = Column(String, nullable=False)
    tgl_mulai = Column(Date, nullable=False)
    tgl_akhir = Column(Date, nullable=False)
    tempat = Column(String, nullable=False)
    tgl_pengesahan = Column(Date, nullable=False)

    used_languages = relationship("UsedLanguage", back_populates="dcc_form")
    mandatory_languages = relationship("MandatoryLanguage", back_populates="dcc_form")
    objects = relationship("DCCObject", back_populates="dcc_form")
    persons = relationship("DCCPerson", back_populates="dcc_form")
    statements = relationship("DCCStatement", back_populates="dcc_form")
    
    nama_cust = Column(String, nullable=False)
    jalan_cust = Column(String, nullable=False)
    no_jalan_cust = Column(String, nullable=False)
    kota_cust = Column(String, nullable=False)
    state_cust = Column(String, nullable=False)
    pos_cust = Column(String, nullable=False)
    negara_cust = Column(String, nullable=False)

class UsedLanguage(Base):
    __tablename__ = "used_languages"
    id = Column(Integer, primary_key=True, index=True)
    dcc_form_id = Column(Integer, ForeignKey("dcc_forms.id"))
    value = Column(String, nullable=False)
    dcc_form = relationship("DCCForm", back_populates="used_languages")

class MandatoryLanguage(Base):
    __tablename__ = "mandatory_languages"
    id = Column(Integer, primary_key=True, index=True)
    dcc_form_id = Column(Integer, ForeignKey("dcc_forms.id"))
    value = Column(String, nullable=False)
    dcc_form = relationship("DCCForm", back_populates="mandatory_languages")

class DCCObject(Base):
    __tablename__ = "dcc_objects"
    id = Column(Integer, primary_key=True, index=True)
    dcc_form_id = Column(Integer, ForeignKey("dcc_forms.id"))
    jenis = Column(String, nullable=False)
    merek = Column(String, nullable=False)
    tipe = Column(String, nullable=False)
    item_issuer = Column(String, nullable=False)
    seri_item = Column(String, nullable=False)
    id_lain = Column(String, nullable=False)
    dcc_form = relationship("DCCForm", back_populates="objects")

class DCCPerson(Base):
    __tablename__ = "dcc_persons"
    id = Column(Integer, primary_key=True, index=True)
    dcc_form_id = Column(Integer, ForeignKey("dcc_forms.id"))
    nama_resp = Column(String, nullable=False)
    nip = Column(String, nullable=False)
    peran = Column(String, nullable=False)
    main_signer = Column(String, nullable=False)
    signature = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    dcc_form = relationship("DCCForm", back_populates="persons")

class DCCStatement(Base):
    __tablename__ = "dcc_statements"
    id = Column(Integer, primary_key=True, index=True)
    dcc_form_id = Column(Integer, ForeignKey("dcc_forms.id"))
    value = Column(String, nullable=False)
    dcc_form = relationship("DCCForm", back_populates="statements")
