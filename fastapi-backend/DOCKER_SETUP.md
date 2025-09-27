# HL7 LiteBoard Docker Setup

Complete Docker Compose setup for the HL7 LiteBoard FastAPI backend with all dependencies.

## Quick Start

```bash
# Start everything with one command
./docker-start.sh

# Or manually
docker-compose up --build -d
```

## Services Included

### 🔧 **Backend Services**
- **FastAPI Backend** (Port 8000) - Main API server
- **PostgreSQL** (Port 5432) - Database with HL7 schema
- **Mock Mastra Service** (Port 3001) - AI processing simulation

### 🛠 **Development Tools**
- **pgAdmin** (Port 8080) - Database management interface

## Service Details

### FastAPI Backend
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health**: http://localhost:8000/health

**Features**:
- Complete HL7 v2 message processing
- Sample file processing
- Multi-format conversion (XML, JSON, PDF)
- Background processing with status tracking
- Comprehensive REST API

### PostgreSQL Database
- **Host**: localhost:5432
- **Database**: hl7_liteboard
- **User**: hl7user
- **Password**: hl7password

**Features**:
- Complete HL7 data schema
- Patient, visit, observation tables
- Processing logs and audit trails
- UUID primary keys
- JSONB for flexible data storage

### Mock Mastra Service
- **URL**: http://localhost:3001
- **Health**: http://localhost:3001/health

**Endpoints**:
- `POST /agents/hl7-to-structured` - Converts HL7 to XML/JSON
- `POST /agents/hl7-to-pdf` - Converts HL7 to PDF
- `GET /agents/{name}/status` - Agent status

**Features**:
- Realistic mock responses
- Simulated processing delays
- Proper error handling
- Detailed logging

### pgAdmin
- **URL**: http://localhost:8080
- **Email**: admin@hl7liteboard.com
- **Password**: admin123

## Testing the System

### 1. Automated Testing
```bash
# Run comprehensive API tests
./test-endpoints.sh
```

### 2. Manual Testing

#### Process Sample Files
```bash
# Process all sample files
curl -X POST http://localhost:8000/api/v1/samples/process-all

# Process specific sample
curl -X POST http://localhost:8000/api/v1/samples/process \
  -H "Content-Type: application/json" \
  -d '{"sample_filename": "adt_admission.hl7"}'
```

#### Upload HL7 File
```bash
# Upload a file
curl -X POST http://localhost:8000/api/v1/upload/hl7 \
  -F "file=@sample_files/oru_lab_results.hl7"
```

#### Upload HL7 Text
```bash
# Upload HL7 as text
curl -X POST http://localhost:8000/api/v1/upload/hl7/text \
  -H "Content-Type: application/json" \
  -d '{
    "hl7_content": "MSH|^~\\&|TEST|HOSPITAL|...",
    "filename": "test.hl7"
  }'
```

#### Browse Messages
```bash
# List processed messages
curl http://localhost:8000/api/v1/browse/messages

# Get statistics
curl http://localhost:8000/api/v1/browse/stats

# Search messages
curl "http://localhost:8000/api/v1/browse/search?q=john&limit=5"
```

#### Retrieve Formats
```bash
# Get all formats for a message
curl http://localhost:8000/api/v1/formats/{MESSAGE_ID}

# Get specific formats
curl http://localhost:8000/api/v1/formats/{MESSAGE_ID}/xml
curl http://localhost:8000/api/v1/formats/{MESSAGE_ID}/json
curl http://localhost:8000/api/v1/formats/{MESSAGE_ID}/pdf
```

## Sample HL7 Files

The system includes realistic sample files:

1. **adt_admission.hl7** - Patient admission with allergies
2. **oru_lab_results.hl7** - Lab results (CBC, metabolic panel)  
3. **orm_medication_order.hl7** - Medication orders
4. **adt_discharge.hl7** - Patient discharge with procedures

## Data Flow

1. **Upload** → HL7 file uploaded via API
2. **Validation** → Basic HL7 format validation  
3. **Storage** → Raw message saved to PostgreSQL
4. **Processing** → Background task calls Mock Mastra
5. **Conversion** → Mock AI generates XML, JSON, PDF
6. **Storage** → Converted formats saved to database
7. **Retrieval** → Formats accessible via API

## Development Features

### Hot Reload
- Backend code changes trigger automatic reload
- Database schema changes via Alembic migrations
- Mock service updates immediately

### Debugging
- Debug logs available via `docker-compose logs -f backend`
- pgAdmin for database inspection
- Health check endpoints for all services

### Database Management
```bash
# Access database directly
docker-compose exec postgres psql -U hl7user -d hl7_liteboard

# Run migrations
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "Description"
```

## Production Considerations

### Environment Variables
Create `.env` file for production:
```env
DATABASE_URL=postgresql://user:pass@host:port/db
GOOGLE_API_KEY=your-real-api-key
MASTRA_ENDPOINT=http://real-mastra-service:3001
DEBUG=False
SECRET_KEY=production-secret-key
```

### Security
- Change default passwords
- Use environment variables for secrets
- Enable SSL/TLS for production
- Implement authentication/authorization
- Set up proper firewall rules

### Scaling
- Use multiple backend replicas
- Implement Redis for session storage
- Set up load balancer
- Monitor resource usage
- Implement proper logging

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

**Backend Won't Start**
```bash
# Check logs
docker-compose logs backend

# Rebuild backend
docker-compose up --build backend

# Check dependencies
docker-compose exec backend pip list
```

**Mock Mastra Not Responding**
```bash
# Check service health
curl http://localhost:3001/health

# Check logs
docker-compose logs mastra-mock

# Restart service
docker-compose restart mastra-mock
```

### Service Health Checks
```bash
# Check all service status
docker-compose ps

# Individual service health
curl http://localhost:8000/health      # Backend
curl http://localhost:3001/health      # Mock Mastra
docker-compose exec postgres pg_isready -U hl7user  # Database
```

### Log Analysis
```bash
# All logs
docker-compose logs

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f mastra-mock

# Filter logs
docker-compose logs backend | grep ERROR
```

## Cleanup

```bash
# Stop services but keep data
docker-compose down

# Stop services and remove volumes (⚠️ deletes data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Full cleanup
docker system prune -a
```

## Next Steps

1. **Connect Real Mastra**: Replace mock service with actual Mastra agents
2. **Add Authentication**: Implement JWT or OAuth2
3. **Build Frontend**: Create React frontend to consume APIs
4. **Add Monitoring**: Implement Prometheus/Grafana
5. **Enhance Testing**: Add unit tests and integration tests

The system is now ready for development and testing! 🚀