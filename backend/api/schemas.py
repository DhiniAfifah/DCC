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
    software: str  # software
    version: str  # versi
    core_issuer: str  # penerbit
    country_code: str  # kode negara
    used_languages: List[Language]  # bahasa yang digunakan
    mandatory_languages: List[Language]  # bahasa wajib
    sertifikat: str  # nomor sertifikat
    order: str  # nomor order
    tgl_mulai: str  # tanggal mulai pengukuran
    tgl_akhir: str  # tanggal akhir pengukuran
    tempat: str  # tempat kalibrasi
    tgl_pengesahan: str  # tanggal pengesahan
    objects: List[ObjectDescription]  # Deskripsi objek yang diukur
    persons: List[ResponsiblePerson]  # Penanggung jawab
    owner: OwnerIdentity  # Identitas pemilik
    statements: List[str]  # Catatan
