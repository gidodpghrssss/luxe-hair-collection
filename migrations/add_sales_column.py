from app import db

def upgrade():
    with db.engine.connect() as connection:
        connection.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS sales INTEGER DEFAULT 0")

def downgrade():
    with db.engine.connect() as connection:
        connection.execute("ALTER TABLE products DROP COLUMN IF EXISTS sales")
