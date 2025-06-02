from pydantic import BaseModel, RootModel
from typing import List, Optional, Any, Union, Dict
from fastapi import UploadFile
from datetime import date


class Language(BaseModel):
    value: str

    @classmethod
    def __get_validators__(cls):
        yield cls.validate_language

    @classmethod
    def validate_language(cls, value):
        if isinstance(value, str):  
            return cls(value=value)
        if isinstance(value, dict) and "value" in value:
            return cls(**value)
        raise ValueError("Invalid language format")
    
class MultilangStr(RootModel[Dict[str, str]]):
    pass

    def __getitem__(self, item):
        return self.__root__.get(item)

    def dict(self, *args, **kwargs):
        return self.__root__

class ObjectDescription(BaseModel):
    jenis: MultilangStr
    merek: str
    tipe: str
    item_issuer: str
    seri_item: str
    id_lain: MultilangStr

# START ResponsiblePersons

class Pelaksana(BaseModel):
    nama_resp: str
    nip: str
    peran: str = "Pelaksana"
    main_signer: bool = False
    signature: bool = False
    timestamp: bool = False

class Penyelia(BaseModel):
    nama_resp: str
    nip: str
    peran: str = "Penyelia"
    main_signer: bool = False
    signature: bool = False
    timestamp: bool = False

class KepalaLaboratorium(BaseModel):
    nama_resp: str
    nip: str
    peran: str  
    main_signer: bool = False
    signature: bool = False
    timestamp: bool = False

class Direktur(BaseModel):
    nama_resp: str
    nip: str
    peran: str  
    main_signer: bool = True
    signature: bool = True
    timestamp: bool = True

class ResponsiblePersons(BaseModel):
    pelaksana: List[Pelaksana]
    penyelia: List[Penyelia]
    kepala: KepalaLaboratorium
    direktur: Direktur
# END ResponsiblePersons

class OwnerIdentity(BaseModel):
    nama_cust: str
    jalan_cust: str
    no_jalan_cust: str
    kota_cust: str
    state_cust: str
    pos_cust: str
    negara_cust: str
    
class Formula(BaseModel):
    latex: str
    mathml: str

class Image(BaseModel):
    caption: Optional[str] = None
    gambar_url: Optional[str] = None
    base64: Optional[str] = None 
    fileName: Optional[str] = None
    mimeType: Optional[str] = None 

class Method(BaseModel):
    method_name: MultilangStr
    method_desc: MultilangStr
    norm: str
    has_formula: bool = False
    formula: Optional[Formula] = None
    has_image: bool = False
    image: Optional[Image] = None
    refType: Optional[str] = None

#COMMENT
class CommentFile(BaseModel):
    fileName: Optional[str] = None
    mimeType: Optional[str] = None
    base64: Optional[str] = None

class Comment(BaseModel):
    title: Optional[str] = None
    desc: Optional[str] = None
    has_file: bool = False
    files: Optional[List[CommentFile]] = None

class Equipment(BaseModel):
    nama_alat: MultilangStr
    manuf_model: MultilangStr
    model: MultilangStr
    seri_measuring: str 
    refType: Optional[str] = None  

class UnitDetail(BaseModel):
    prefix: Optional[str] = None
    prefix_pdf: Optional[str] = None
    unit: Optional[str] = None
    unit_pdf: Optional[str] = None
    eksponen: Optional[str] = None
    eksponen_pdf: Optional[str] = None

class Condition(BaseModel):
    jenis_kondisi: str 
    desc: MultilangStr
    tengah: str  
    rentang: str  
    rentang_unit: UnitDetail 
    tengah_unit: UnitDetail

class Statements(BaseModel):
    values: MultilangStr
    has_formula: bool = False
    formula: Optional[Formula] = None
    has_image: bool = False
    image: Optional[Image] = None
    refType: Optional[str] = None

class AdministrativeData(BaseModel):
    country_code: str  # Country of Calibration
    used_languages: List[str] 
    mandatory_languages: List[str]  
    order: str  # Order Number
    core_issuer: str
    sertifikat: str 
    tempat: str
    tempat_pdf: Optional[str]
    
class MeasurementTimeline(BaseModel):
    tgl_mulai: str  # tanggal mulai pengukuran
    tgl_akhir: str  # tanggal akhir pengukuran
    tgl_pengesahan: str  # tanggal pengesahan

class Uncertainty(BaseModel):
    factor: str
    probability: str
    distribution: Optional[str] = ""
    real_list: str

class Column(BaseModel):
    kolom: MultilangStr
    real_list: int 
    refType: Optional[str] = None 

class Result(BaseModel):
    parameters: List[MultilangStr]  
    columns: List[Column]
    uncertainty: Uncertainty

class DCCFormCreate(BaseModel):
    software: str  # software
    version: str  # versi
    Measurement_TimeLine: MeasurementTimeline
    administrative_data: AdministrativeData
    objects: List[ObjectDescription]  # Deskripsi objek yang diukur
    responsible_persons: ResponsiblePersons  # Penanggung jawab
    owner: OwnerIdentity  # Identitas pemilik
    methods: List[Method]  # Metode
    equipments: List[Equipment]  # Peralatan
    conditions: List[Condition]  # Kondisi (Suhu dan Kelembapan)
    results: List[Result]
    excel: Optional[str]
    sheet_name: str
    statements: List[Statements]  # Catatan
    comment: Optional[Comment]
