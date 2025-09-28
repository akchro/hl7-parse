# Prism

A lightweight, clinician-friendly solution that transforms complex HL7 data streams into digestible, editable, and exportable formats. Built for healthcare professionals to bridge the gap between technical HL7 standards and daily clinical workflows. The platform supports AI-powered conversion into clean, interactive formats (XML, JSON, PDF).

---

##  Overview

Prism translates complex HL7 v2 messages into a clean, interactive dashboard, allowing healthcare professionals to quickly review, update, and generate patient records in familiar formats (PDF, JSON, XML).  
This tool reduces intake and discharge times while lowering integration costs for healthcare systems.

---

##  Problem Statement

- **Complexity of HL7**: HL7 v2 is the backbone of healthcare interoperability, but its structure is highly technical and difficult for non-technical users to interpret.  
- **Cost of Integration**: Hospitals spend significant resources on interface engines and consultants to manage HL7 data.  
- **Workflow Inefficiencies**: Patient intake and discharge involve multiple handoffs, resulting in delays, redundant data entry, and errors.  
- **Accessibility Gap**: Non-technical healthcare staff cannot easily read, update, or act on HL7 data without IT involvement.  

---

##  Solution

Prism provides a simplified interface that:

- **Ingests** HL7 v2 messages (e.g., ADT for admissions, ORU for labs).  
- **Transforms** and displays patient information in an intuitive dashboard.  
- **Enables** real-time edits to key fields (allergies, medications, discharge notes).  
- **Generates** updated HL7/FHIR messages to maintain interoperability.  
- **Provides** one-click export in PDF, JSON, or XML formats for easy sharing and record-keeping.  

This system acts as a translation and interaction layer between hospital systems and healthcare professionals, improving usability without requiring deep technical expertise.

---

##  System Overview

### Core Components
- **React Frontend** (Port 5173) – Modern React app with shadcn/ui components  
- **FastAPI Backend** (Port 8000) – HL7 processing API with comprehensive endpoints  
- **PostgreSQL Database** (Port 5432) – HL7 schema with audit trails  
- **Mastra AI Service** (Port 3001) – AI-powered document conversion service  
- **pgAdmin** (Port 8080) – Database management interface  

### Optional Components (via profiles)
- **Prometheus** (Port 9090) – Metrics collection  
- **Grafana** (Port 3000) – Dashboards and visualization  

---

##  Architecture

```

HL7 File Upload → FastAPI → Database Storage → Mastra AI → Multi-format Output
↓              ↓            ↓              ↓            ↓
Validation    Processing    PostgreSQL   XML/JSON/PDF   Frontend Access

````

Prism also acts as middleware:  
1. **Receives** HL7 v2 messages from hospital systems  
2. **Parses** and transforms data into structured JSON  
3. **Presents** information via a web interface  
4. **Captures** clinician updates and modifications  
5. **Generates** updated HL7/FHIR messages for system integration  

---

## Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Server state management
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Clerk** - Authentication and user management
- **Recharts** - Data visualization
- **Zustand** - State management

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migrations
- **Pydantic** - Data validation

### AI/ML Services
- **Mastra** - AI agent framework for document processing
- **TypeScript** - AI service implementation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration
- **Nginx** - Reverse proxy and static file serving
- **pgAdmin** - Database administration

---

##  Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd hl7-parse
```

### Option 1: Frontend Development

For UI development and testing the React components:

```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev
```

The React app will be available at `http://localhost:5173`.

**Note**: For full functionality, you'll need the backend services running (see Option 2).

### Option 2: Full Stack Development (Docker)

For complete HL7 processing functionality with all services:

```bash
# Start core services (Frontend, Backend, Database, AI Service)
./start.sh

# Or start with monitoring (includes Prometheus & Grafana)
./start.sh --monitoring

# Or start everything (all services + monitoring)
./start.sh --all
```

### Option 3: Backend Development

For API development and testing:

```bash
# Navigate to backend directory
cd fastapi-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python run.py
```

API will be available at `http://localhost:8000`.

##  Testing

### Frontend Testing

```bash
# Install dependencies (if not already done)
npm install

# Run type checking
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

### Backend Testing

```bash
# API endpoint tests
./fastapi-backend/test-endpoints.sh

# Or manually test API health
curl http://localhost:8000/health
```

### Manual HL7 Testing

```bash
# Process all sample HL7 files
curl -X POST http://localhost:8000/api/v1/samples/process-all

# Upload and convert a specific HL7 file
curl -X POST -F "file=@sample.hl7" http://localhost:8000/api/v1/upload
```


##  Access Points

* **React Frontend**: [http://localhost:5173](http://localhost:5173)
* **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Health**: [http://localhost:8000/health](http://localhost:8000/health)
* **Database Admin**: [http://localhost:8080](http://localhost:8080) ([admin@hl7liteboard.com](mailto:admin@hl7liteboard.com) / admin123)
* **Mastra AI Service**: [http://localhost:3001/health](http://localhost:3001/health)


##  Use Cases

* **Emergency Department**: Quick patient intake and updates
* **Laboratory Results**: Clean presentation of ORU messages
* **Patient Transfers**: Streamlined ADT message management
* **Discharge Planning**: Efficient preparation of discharge summaries


##  Development

### Project Structure

```
hl7-parse/
├── src/                     # React frontend source
│   ├── components/         # UI components
│   ├── features/           # Feature modules
│   ├── routes/             # App routing
│   └── lib/                # Utilities
├── fastapi-backend/         # FastAPI application
│   ├── app/                # Application code
│   ├── sample_files/       # 4 realistic HL7 samples
│   └── Dockerfile
├── mastra-service/          # AI conversion service
│   ├── src/                # TypeScript source
│   └── Dockerfile
├── docker-compose.yml
├── package.json            # Frontend dependencies
└── start.sh
```

### Sample HL7 Files

* **adt_admission.hl7** – Patient admission with allergies
* **oru_lab_results.hl7** – Laboratory results (CBC, metabolic panel)
* **orm_medication_order.hl7** – Medication orders
* **adt_discharge.hl7** – Patient discharge with procedures

### Features Implemented

 Modern React frontend with shadcn/ui components  
 HL7 v2 parsing and validation  
 AI-powered multi-format conversion (XML, JSON, PDF)  
Interactive dashboard for real-time edits  
 REST API with OpenAPI documentation  
 PostgreSQL database with full schema  
 Docker containerization  
 Authentication and user management  
 Responsive design with dark/light themes

---

##  Security

* Input validation & sanitization
* SQL injection prevention
* File size/type validation
* Error handling without leaks
* Env-based configuration

---

##  Production Considerations

* Replace mock AI with real agents
* Add authentication/authorization
* Enable rate limiting & throttling
* Set up SSL/TLS
* Implement backups & monitoring

---

##  Contributing

* Extend HL7 models in `app/models/`
* Add API endpoints in `app/routers/`
* Add logic in `app/services/`
* Schema updates via Alembic migrations

---

##  License

MIT License – free to use and improve for better healthcare workflows.

---

**Built for Better Healthcare Interoperability** 

Prism bridges the technical gap between healthcare systems and the clinicians who use them.
