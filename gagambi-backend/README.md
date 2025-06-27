# Gagambi Backend API

A production-ready FastAPI backend for the Gagambi platform, featuring JWT authentication, SQLAlchemy ORM, and Docker support.

## 🚀 Features

- **FastAPI** framework for high performance
- **JWT Authentication** with secure password hashing
- **SQLAlchemy ORM** with MySQL support
- **Pydantic** for data validation
- **Docker** & **Docker Compose** support
- **Alembic** for database migrations
- **CORS** enabled for frontend integration
- **Auto-generated API documentation** (Swagger/ReDoc)

## 📋 Prerequisites

- Python 3.11+
- MySQL 8.0+ (or use the Docker container)
- Docker & Docker Compose (optional)

## 🛠️ Quick Start

### Option 1: Using the startup script

```bash
./start.sh
```

This will:
1. Create a virtual environment
2. Install dependencies
3. Initialize the database
4. Start the FastAPI server

### Option 2: Manual setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
python init_db.py

# Run the application
uvicorn app.main:app --reload
```

### Option 3: Using Docker Compose

```bash
docker-compose up -d
```

## 🔧 Configuration

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL=mysql://TBWA:R%40nd0mPA%242025%21@127.0.0.1:3308/gagambi_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 📚 API Documentation

Once running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

## 🔐 Default Users

After initialization, these users are available:

| Username | Password | Role |
|----------|----------|------|
| admin    | admin123 | Superuser |
| testuser | test123  | Regular User |

## 📁 Project Structure

```
gagambi-backend/
├── app/
│   ├── api/          # API endpoints
│   ├── core/         # Core configuration
│   ├── crud/         # CRUD operations
│   ├── db/           # Database configuration
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   └── main.py       # FastAPI application
├── tests/            # Test files
├── alembic/          # Database migrations
├── requirements.txt  # Python dependencies
├── Dockerfile        # Docker configuration
├── docker-compose.yml
└── README.md
```

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## 🚀 Deployment

### Using Docker

```bash
# Build the image
docker build -t gagambi-api .

# Run the container
docker run -d -p 8000:8000 --env-file .env gagambi-api
```

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔗 Frontend Integration

The API is configured to accept CORS requests from:
- http://localhost:3000
- http://localhost:5173
- https://gagambi.com

To add more origins, update `BACKEND_CORS_ORIGINS` in `.env`.

## 📊 Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🛡️ Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Environment variables for sensitive data
- CORS protection enabled
- SQL injection protection via SQLAlchemy ORM

## 📝 License

This project is proprietary and confidential.