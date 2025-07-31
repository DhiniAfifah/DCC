from pydantic import BaseModel, RootModel
from typing import List, Optional, Any, Union, Dict
from fastapi import UploadFile
from datetime import date
from pydantic import BaseModel, validator
from enum import Enum

class DCCStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

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
    
class MultilangStr(RootModel):
    root: Dict[str, str]  # Tambahkan deklarasi tipe root

    def __getitem__(self, item):
        return self.root.get(item)

    def __hash__(self):
        # Mengubah objek menjadi representasi yang bisa di-hash
        return hash(frozenset(self.root.items()))

    def __eq__(self, other):
        # Perbandingan objek MultilangStr berdasarkan nilai di dalam root
        return isinstance(other, MultilangStr) and self.root == other.root

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
    main_signer: bool = 0
    signature: bool = 0
    timestamp: bool = 0

class Penyelia(BaseModel):
    nama_resp: str
    nip: str
    peran: str = "Penyelia"
    main_signer: bool = 0
    signature: bool = 0
    timestamp: bool = 0

class KepalaLaboratorium(BaseModel):
    nama_resp: str
    nip: str
    peran: str  
    main_signer: bool = 0
    signature: bool = 0
    timestamp: bool = 0

class Direktur(BaseModel):
    nama_resp: str
    nip: str
    peran: str  
    main_signer: bool = 1
    signature: bool = 1
    timestamp: bool = 1

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
    latex: Optional[str] = None 
    mathml: Optional[str] = None

class Image(BaseModel):
    caption: Optional[str] = None
    gambar_url: Optional[str] = None
    gambar: Optional[str] = None
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
    desc: MultilangStr
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
    refType: Optional[str] = None

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

class Column(BaseModel):
    kolom: MultilangStr
    refType: str  
    real_list: int 
    
class Result(BaseModel):
    parameters: MultilangStr
    columns: List[Column]
    uncertainty: Uncertainty
    
#LOGIN & REGISTER    
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None

class User(UserBase):
    id: int
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

    class Config:
        orm_mode = True

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
    scopes: list[str] = []

class DCCFormCreate(BaseModel):
    status: DCCStatus = DCCStatus.pending
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

class ExcelFileResponse(BaseModel):
    excel_file_path: str