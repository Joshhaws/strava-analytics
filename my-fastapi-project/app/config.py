import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("VITE_JWT_SECRET")
DB_CONFIG = {
    'user': os.getenv("VITE_DB_USER"),
    'host': os.getenv("VITE_DB_HOST"),
    'database': os.getenv("VITE_DB_NAME"),
    'password': os.getenv("VITE_DB_PASSWORD"),
    'port': int(os.getenv("VITE_DB_PORT", 5432))
}

print(f"JWT_SECRET: {JWT_SECRET}")
print(f"DB_CONFIG: {DB_CONFIG}")