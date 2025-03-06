from pydantic import BaseModel
from typing import List

# Model untuk Bahasa
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

# Model Deskripsi Objek yang Diukur
class ObjectDescription(BaseModel):
    jenis: str
    merek: str
    tipe: str
    item_issuer: str
    seri_item: str
    id_lain: str

# Model untuk Penanggung Jawab
class ResponsiblePerson(BaseModel):
    nama_resp: str
    nip: str
    peran: str
    main_signer: str
    signature: str
    timestamp: str

# Model Identitas Pemilik
class OwnerIdentity(BaseModel):
    nama_cust: str
    jalan_cust: str
    no_jalan_cust: str
    kota_cust: str
    state_cust: str
    pos_cust: str
    negara_cust: str

# Model untuk Metode
class Method(BaseModel):
    method_name: str  # Nama Metode
    method_desc: str  # Deskripsi Metode
    norm: str  # Norm

# Model untuk Alat Pengukuran
class Equipment(BaseModel):
    nama_alat: str  # Nama alat pengukuran
    manuf_model: str  # Manufacturer dan Model
    seri_measuring: str  # Nomor Seri alat pengukuran

# Model untuk Kondisi Ruangan
class Condition(BaseModel):
    kondisi: str  # Jenis Kondisi (misal: Suhu, Kelembapan)
    kondisi_desc: str  # Deskripsi Kondisi
    center_point: float  # Titik Tengah
    center_unit: str  # Satuan untuk Titik Tengah (misal: Celsius)
    range_value: float  # Rentang Kondisi
    range_unit: str  # Satuan untuk Rentang (misal: Celsius)

# Model untuk Pernyataan
class Statement(BaseModel):
    statement: str  # Pernyataan yang diinputkan

# Model utama untuk Form Input DCC
class DCCFormCreate(BaseModel):
    software: str  # Nama software
    version: str  # Versi software
    core_issuer: str  # Penerbit Sertifikat
    country_code: str  # Kode Negara
    used_languages: List[Language]  # Bahasa yang digunakan
    mandatory_languages: List[Language]  # Bahasa wajib
    sertifikat: str  # Nomor Sertifikat
    order: str  # Nomor Order
    tgl_mulai: str  # Tanggal Mulai Pengukuran
    tgl_akhir: str  # Tanggal Akhir Pengukuran
    tempat: str  # Tempat Kalibrasi
    tgl_pengesahan: str  # Tanggal Pengesahan
    objects: List[ObjectDescription]  # Deskripsi Objek yang Diukur
    responsible_persons: List[ResponsiblePerson]  # Penanggung Jawab
    owner: OwnerIdentity  # Identitas Pemilik
    statements: List[Statement]  # List Pernyataan

    # Tambahkan data untuk Measurement Form (Metode, Alat Pengukuran, Kondisi)
    methods: List[Method]  # Metode Pengukuran
    equipments: List[Equipment]  # Alat Pengukuran
    conditions: List[Condition]  # Kondisi Ruangan
