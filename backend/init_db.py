from models import Base
from db import engine

# Create all tables
Base.metadata.create_all(bind=engine)

print("Database tables created.")
