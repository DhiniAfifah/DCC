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
    jenis: Optional[str] = None
    merek: Optional[str] = None
    tipe: Optional[str] = None
    issuer: Optional[str] = None
    seri: Optional[str] = None
    idLain: Optional[str] = None

class ResponsiblePerson(BaseModel):
    name: str
    nip: str
    role: str
    signature: Optional[str] = None
    timestamp: Optional[str] = None

class OwnerIdentity(BaseModel):
    name: str
    street_name: str
    street_number: str
    city: str
    province: str
    postal_code: str
    country: str

class DCCFormCreate(BaseModel):
    software_name: str
    software_version: str
    issuer: str
    country: str
    used_languages: List[Language]
    mandatory_languages: List[Language]
    certificate_number: str
    order_number: str
    measurement_start: str
    measurement_end: str
    calibration_place: str
    approval_date: str
    objects: List[ObjectDescription]
    responsible_person: ResponsiblePerson
    owner_identity: OwnerIdentity
    statements: List[str] 
