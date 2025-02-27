from pydantic import BaseModel
from typing import List, Optional

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

class ObjectDescription(BaseModel):
    jenis: str
    merek: str
    tipe: str
    item_issuer: str
    seri_item: str
    id_lain: str

class ResponsiblePerson(BaseModel):
    nama_resp: str
    nip: str
    peran: str
    main_signer: str
    signature: str
    timestamp: str

class OwnerIdentity(BaseModel):
    nama_cust: str
    jalan_cust: str
    no_jalan_cust: str
    kota_cust: str
    state_cust: str
    pos_cust: str
    negara_cust: str

class DCCFormCreate(BaseModel):
    software: str
    version: str
    core_issuer: str
    country_code: str
    used_languages: List[Language]
    mandatory_languages: List[Language]
    sertifikat: str
    order: str
    tgl_mulai: str
    tgl_akhir: str
    tempat: str
    tgl_pengesahan: str
    objects: List[ObjectDescription]
    persons: List[ResponsiblePerson]
    owner: OwnerIdentity
    statements: List[str] 
