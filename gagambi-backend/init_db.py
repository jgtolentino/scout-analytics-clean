#!/usr/bin/env python3
"""Initialize database with tables and sample data."""

from sqlalchemy import create_engine
from app.db.base import Base
from app.core.config import settings
from app.models.user import User
from app.crud.user import user as crud_user
from app.schemas.user import UserCreate
from sqlalchemy.orm import Session

def init_db():
    """Initialize database."""
    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    
    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
    
    # Create session
    db = Session(engine)
    
    # Create superuser if doesn't exist
    superuser = crud_user.get_by_username(db, username="admin")
    if not superuser:
        print("Creating superuser...")
        superuser_in = UserCreate(
            email="admin@gagambi.com",
            username="admin",
            full_name="Admin User",
            password="admin123",
            is_superuser=True,
            is_active=True
        )
        crud_user.create(db, obj_in=superuser_in)
        print("✅ Superuser created!")
        print("   Username: admin")
        print("   Password: admin123")
    else:
        print("ℹ️  Superuser already exists")
    
    # Create test user if doesn't exist
    test_user = crud_user.get_by_username(db, username="testuser")
    if not test_user:
        print("Creating test user...")
        test_user_in = UserCreate(
            email="test@gagambi.com",
            username="testuser",
            full_name="Test User",
            password="test123",
            is_superuser=False,
            is_active=True
        )
        crud_user.create(db, obj_in=test_user_in)
        print("✅ Test user created!")
        print("   Username: testuser")
        print("   Password: test123")
    else:
        print("ℹ️  Test user already exists")
    
    db.close()
    print("\n✅ Database initialization complete!")


if __name__ == "__main__":
    init_db()