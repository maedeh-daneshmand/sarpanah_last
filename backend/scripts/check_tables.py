import sys
from os.path import abspath, dirname
sys.path.insert(0, dirname(dirname(abspath(__file__))))

from app.db.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
query = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
tables = [row[0] for row in db.execute(query).fetchall()]
print(f"Total tables found in PostgreSQL: {len(tables)}")
for t in tables:
    print(f" - {t}")
db.close()
