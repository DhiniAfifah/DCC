from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

# Inisialisasi password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str) -> models.User | None:
    """
    Mendapatkan user berdasarkan email
    
    Args:
        db: Session database
        email: Email user yang dicari
    
    Returns:
        User object jika ditemukan, None jika tidak
    """
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """
    Membuat user baru di database
    
    Args:
        db: Session database
        user: Data user baru dari request
    
    Returns:
        User object yang baru dibuat
    """
    # Cek apakah email sudah terdaftar
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise ValueError("Email already registered")
    
    # Hash password sebelum disimpan
    hashed_password = pwd_context.hash(user.password)
    
    # Buat objek user baru
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    
    # Simpan ke database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> models.User | None:
    """
    Autentikasi user berdasarkan email dan password
    """
    user = get_user_by_email(db, username)
    if not user:
        return None
    
    if not pwd_context.verify(password, user.hashed_password):
        return None
    
    return user

def update_user_password(db: Session, user: models.User, new_password: str) -> models.User:
    """
    Update password user
    
    Args:
        db: Session database
        user: User object
        new_password: Password baru
    
    Returns:
        User object yang telah diupdate
    """
    user.hashed_password = pwd_context.hash(new_password)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_id(db: Session, user_id: int) -> models.User | None:
    """
    Mendapatkan user berdasarkan ID
    
    Args:
        db: Session database
        user_id: ID user
    
    Returns:
        User object jika ditemukan, None jika tidak
    """
    return db.query(models.User).filter(models.User.id == user_id).first()

def is_director(user: models.User) -> bool:
    """
    Check if user has director role
    
    Args:
        user: User object
    
    Returns:
        True if user is director, False otherwise
    """
    return user.role == models.UserRole.director