from api.database import engine, Base
from api import models

print("Membuat tabel di database...")
Base.metadata.create_all(bind=engine)
print("Tabel berhasil dibuat.")
