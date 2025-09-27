# HL7 LiteBoard FastAPI Backend

A FastAPI-based backend service for processing HL7 v2 messages and converting them into multiple formats (XML, JSON, PDF) using AI-powered Mastra agents.

## Features

- **HL7 v2 Message Processing**: Parse and validate HL7 messages
- **Multi-format Conversion**: Convert HL7 to XML, JSON, and PDF using Mastra AI
- **Sample Files**: Pre-loaded sample HL7 files for testing
- **Database Storage**: PostgreSQL with comprehensive HL7 data models
- **RESTful API**: Complete REST API with OpenAPI documentation
- **Data Unescaping**: Proper handling of HL7 escape sequences
- **Background Processing**: Asynchronous processing with status tracking

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- Mastra AI service (for production) or use mock service for development

### Installation

1. **Clone and Setup**
```bash
cd fastapi-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
```bash
# Initialize Alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

4. **Run Development Server**
```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

### Upload Endpoints
- `POST /api/v1/upload/hl7` - Upload HL7 file
- `POST /api/v1/upload/hl7/text` - Upload HL7 as text
- `POST /api/v1/upload/batch` - Upload multiple HL7 files
- `GET /api/v1/upload/status/{message_id}` - Get processing status

### Format Retrieval
- `GET /api/v1/formats/{message_id}` - Get all available formats
- `GET /api/v1/formats/{message_id}/xml` - Get XML format
- `GET /api/v1/formats/{message_id}/json` - Get JSON format
- `GET /api/v1/formats/{message_id}/pdf` - Get PDF format
- `GET /api/v1/formats/{message_id}/raw` - Get original HL7
- `GET /api/v1/download/{message_id}/{format}` - Download format

### Sample Files
- `GET /api/v1/samples` - List sample HL7 files
- `POST /api/v1/samples/process` - Process sample file
- `POST /api/v1/samples/process-all` - Process all samples
- `GET /api/v1/samples/{filename}/content` - Get sample content

### Browse & Search
- `GET /api/v1/browse/messages` - Browse processed messages
- `GET /api/v1/browse/messages/{message_id}` - Get message details
- `GET /api/v1/browse/stats` - Get processing statistics
- `GET /api/v1/browse/search` - Search messages

## Sample HL7 Files

The backend includes realistic sample files:

- **adt_admission.hl7** - Patient admission with allergies
- **oru_lab_results.hl7** - Laboratory results (CBC, metabolic panel)
- **orm_medication_order.hl7** - Medication orders
- **adt_discharge.hl7** - Patient discharge with procedures

## Architecture

### Core Components

```
app/
├── main.py              # FastAPI application
├── config.py            # Configuration settings
├── models/              # Pydantic data models
├── routers/             # API route handlers
├── services/            # Business logic
├── database/            # SQLAlchemy models
└── utils/               # Utility functions
```

### Services

- **HL7Processor**: Handles HL7 parsing and database operations
- **MastraService**: Integrates with Mastra AI agents
- **FileHandler**: Manages file operations
- **DataProcessor**: Handles HL7 data unescaping and normalization

### Database Models

- **HL7Message**: Primary message storage
- **ProcessingLog**: Processing history and errors
- **PatientData**: Extracted patient demographics
- **VisitData**: Visit/encounter information
- **ObservationData**: Lab results and observations
- **AllergyData**: Patient allergies

## Data Flow

1. **Upload**: HL7 file/content uploaded via API
2. **Validation**: Basic HL7 format validation
3. **Storage**: Save raw message to PostgreSQL
4. **Processing**: Background task calls Mastra agents
5. **Conversion**: AI agents convert to XML, JSON, PDF
6. **Storage**: Save converted formats to database
7. **Retrieval**: Frontend retrieves processed formats

## Mastra Integration

The backend integrates with Mastra AI for format conversion:

### Production Mode
- Calls actual Mastra agents via HTTP
- Requires Mastra service running on configured endpoint
- Two agents: HL7-to-structured (XML/JSON) and HL7-to-PDF

### Development Mode (Mock)
- Uses MockMastraService for testing
- Generates realistic sample outputs
- No external dependencies

## Configuration

Key environment variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Mastra AI
GOOGLE_API_KEY=your-api-key
MASTRA_ENDPOINT=http://localhost:3001

# Processing
MAX_FILE_SIZE=10485760
PROCESS_TIMEOUT=300
```

## Error Handling

- Comprehensive input validation
- Graceful error recovery
- Detailed error logging
- Processing status tracking
- Partial success handling

## Testing

```bash
# Run with sample data
curl -X POST "http://localhost:8000/api/v1/samples/process-all"

# Check processing status
curl "http://localhost:8000/api/v1/browse/stats"

# Upload test file
curl -X POST "http://localhost:8000/api/v1/upload/hl7" \
  -F "file=@sample_files/adt_admission.hl7"
```

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Security Features

- Input validation and sanitization
- File size limits
- SQL injection prevention
- Proper error handling
- CORS configuration

## Performance

- Asynchronous processing
- Database connection pooling
- Background task queuing
- Efficient file handling
- Pagination for large datasets

## Monitoring

The API provides endpoints for monitoring:
- Processing statistics
- Error rates
- Message counts
- System health

## Development

### Code Structure
- Type hints throughout
- Pydantic models for validation
- SQLAlchemy async ORM
- Clean separation of concerns

### Adding New Features
1. Add Pydantic models in `models/`
2. Create database models in `database/`
3. Implement business logic in `services/`
4. Add API endpoints in `routers/`
5. Update documentation

## Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy with proper WSGI server (Gunicorn + Uvicorn)
5. Set up Mastra AI service
6. Configure reverse proxy (Nginx)

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review the sample files and test endpoints
3. Check logs for error details
4. Verify Mastra service connectivity