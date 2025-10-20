from sqlalchemy import Column, String, Integer, JSON, Boolean, Enum, DateTime, ForeignKey
import enum
import datetime
from .database import Base
from sqlalchemy.orm import relationship

class DCCStatusEnum(str, enum.Enum):
    pending_head = "pending_head"
    approved_head = "approved_head"
    rejected_head = "rejected_head"
    approved_director = "approved_director"
    rejected_director = "rejected_director"

class UserRole(str, enum.Enum):
    user = "user"
    head = "head"
    director = "director"

class DCC(Base):
    __tablename__ = "dcc"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(Enum(DCCStatusEnum), default=DCCStatusEnum.pending_head)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))))  # WIB timezone
    submitter_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    submitter = relationship("User", foreign_keys=[submitter_id])
    software_name = Column(String)
    software_version = Column(String)
    Measurement_TimeLine = Column(JSON)
    administrative_data = Column(JSON)
    objects_description = Column(JSON)  
    responsible_persons = Column(JSON)  
    owner = Column(JSON)  
    methods = Column(JSON)  
    equipments = Column(JSON)  
    conditions = Column(JSON)  
    statement = Column(JSON) 
    comment = Column(JSON, nullable=True) 
    excel = Column(String, nullable=False)  
    sheet_name = Column(String, nullable=False)
    results = Column(JSON)
    
class XML(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_path = Column(String, index=True)
    status = Column(String, default="pending_head")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    disabled = Column(Boolean, default=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    drafts = relationship("Draft", back_populates="user", cascade="all, delete-orphan")

class Draft(Base):
    __tablename__ = "drafts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String, nullable=False)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))), onupdate=lambda: datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))))
    user = relationship("User", back_populates="drafts")