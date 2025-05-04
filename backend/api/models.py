from sqlalchemy import Column, String, Integer, Date, Text, JSON
from .database import Base
from sqlalchemy.orm import Mapped


class DCC(Base):
    __tablename__ = "dcc"

    id = Column(Integer, primary_key=True, index=True)
    software_name = Column(String)
    software_version = Column(String)
    measurement_TimeLine= Column(JSON)
    administrative_data = Column(JSON)
    objects_description = Column(Text)  
    responsible_persons = Column(Text)  
    owner = Column(Text)  
    methods = Column(Text)  
    equipments = Column(Text)  
    conditions = Column(JSON)  
    statements = Column(Text) 
    excel = Column(String)
    sheet_name = Column(String)
