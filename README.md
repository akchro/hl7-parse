# HL7 LiteBoard

A lightweight, clinician-friendly solution that ingests HL7 data streams and presents them in a digestible, editable, and exportable format. The platform translates complex HL7 v2 messages into clean, interactive formats (XML, JSON, PDF) using AI-powered conversion.

## 🚀 Quick Start

```bash
# Start the complete system
./start.sh

# Or with monitoring stack
./start.sh --monitoring

# Or with everything
./start.sh --all
```

## 📋 System Overview

### Core Components

- **FastAPI Backend** (Port 8000) - HL7 processing API with comprehensive endpoints
- **PostgreSQL Database** (Port 5432) - Complete HL7 data schema with audit trails  
- **Mock Mastra Service** (Port 3001) - AI agent simulation for format conversion
- **pgAdmin** (Port 8080) - Database management interface

### Optional Components (via profiles)

- **Prometheus** (Port 9090) - Metrics collection and monitoring
- **Grafana** (Port 3000) - Dashboards and visualization
- **React Frontend** (Port 80) - User interface (future)

## 🏗️ Architecture

```
HL7 File Upload → FastAPI → Database Storage → Mastra AI → Multi-format Output
     ↓              ↓            ↓              ↓            ↓
   Validation    Processing    PostgreSQL   XML/JSON/PDF   Frontend Access
```

## 🧪 Testing

### Automated Testing
```bash
# Run comprehensive API tests
./fastapi-backend/test-endpoints.sh
```

### Quick Manual Tests
```bash
# Process all sample files
curl -X POST http://localhost:8000/api/v1/samples/process-all

# Check processing stats
curl http://localhost:8000/api/v1/browse/stats

# Upload HL7 text
curl -X POST http://localhost:8000/api/v1/upload/hl7/text \
  -H "Content-Type: application/json" \
  -d '{"hl7_content": "MSH|^~\\&|TEST|...", "filename": "test.hl7"}'
```

## 📊 Access Points

- **API Documentation**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/health  
- **Database Admin**: http://localhost:8080 (admin@hl7liteboard.com / admin123)
- **Mock Mastra**: http://localhost:3001/health

## 🔧 Development

### Project Structure
```
hl7-parse/
├── fastapi-backend/         # FastAPI application
│   ├── app/                # Application code
│   ├── sample_files/       # 4 realistic HL7 samples
│   ├── mock-mastra/        # Mock AI service
│   └── Dockerfile          # Backend container
├── docker-compose.yml      # Single compose file
└── start.sh               # Unified startup script
```

### Sample HL7 Files Included
- **adt_admission.hl7** - Patient admission with allergies
- **oru_lab_results.hl7** - Laboratory results (CBC, metabolic panel)
- **orm_medication_order.hl7** - Medication orders  
- **adt_discharge.hl7** - Patient discharge with procedures

### Key Features Implemented
✅ HL7 v2 message parsing and validation  
✅ Multi-format conversion (XML, JSON, PDF) via AI  
✅ Background processing with status tracking  
✅ Comprehensive REST API with OpenAPI docs  
✅ Database storage with full HL7 schema  
✅ Sample file processing system  
✅ Data unescaping and normalization  
✅ Search and browse functionality  

## 🔌 API Endpoints

### Upload & Processing
- `POST /api/v1/upload/hl7` - Upload HL7 file
- `POST /api/v1/upload/hl7/text` - Upload HL7 as text
- `GET /api/v1/upload/status/{id}` - Check processing status

### Format Retrieval  
- `GET /api/v1/formats/{id}` - Get all available formats
- `GET /api/v1/formats/{id}/xml` - Get XML format
- `GET /api/v1/formats/{id}/json` - Get JSON format
- `GET /api/v1/formats/{id}/pdf` - Get PDF format

### Browse & Search
- `GET /api/v1/browse/messages` - Browse processed messages
- `GET /api/v1/browse/stats` - Processing statistics
- `GET /api/v1/browse/search` - Search messages

### Sample Files
- `GET /api/v1/samples` - List sample files
- `POST /api/v1/samples/process` - Process specific sample
- `POST /api/v1/samples/process-all` - Process all samples

## 🎯 User Flow

1. **Upload** → HL7 file uploaded via web interface or API
2. **Validation** → System validates HL7 v2 format
3. **Storage** → Raw message stored in PostgreSQL
4. **AI Processing** → Mastra agents convert to XML, JSON, PDF
5. **Access** → Users browse and download converted formats

## 🐳 Docker Commands

```bash
# Start core services
./start.sh

# Start with monitoring
./start.sh --monitoring

# Start everything  
./start.sh --all

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild
docker-compose up --build -d
```

## 🛠️ Management

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U hl7user -d hl7_liteboard

# Run migrations
docker-compose exec backend alembic upgrade head
```

### Service Health
```bash
# Check all services
docker-compose ps

# Individual health checks
curl http://localhost:8000/health      # Backend
curl http://localhost:3001/health      # Mock Mastra
```

## 🔒 Security

- Input validation and sanitization
- SQL injection prevention  
- File size limits and type validation
- Proper error handling without information leakage
- Environment variable configuration

## 📈 Production Considerations

- Replace mock Mastra service with real AI agents
- Implement authentication/authorization
- Add rate limiting and request throttling
- Set up SSL/TLS certificates
- Configure monitoring and alerting
- Implement backup strategies

## 🤝 Contributing

1. The system is modular and extensible
2. Add new HL7 message types in `app/models/`
3. Extend API endpoints in `app/routers/`
4. Add business logic in `app/services/`
5. Database changes via Alembic migrations

## 📚 Documentation

- **API Docs**: Available at `/docs` when running
- **Database Schema**: See `app/database/models.py`
- **Sample Data**: Realistic HL7 examples in `sample_files/`

---

**Built for healthcare professionals to easily work with HL7 data without technical complexity.** 🏥✨