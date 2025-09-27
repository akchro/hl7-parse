# HL7 LiteBoard

A lightweight, clinician-friendly solution that ingests HL7 data streams and presents them in a digestible, editable, and exportable format. Built for healthcare professionals to bridge the gap between complex HL7 standards and daily clinical workflows. The platform also supports AI-powered conversion into clean, interactive formats (XML, JSON, PDF).

---

## 🚀 Overview

HL7 LiteBoard translates complex HL7 v2 messages into a clean, interactive dashboard, allowing healthcare professionals to quickly review, update, and generate patient records in familiar formats (PDF, JSON, XML).  
This tool reduces intake and discharge times while lowering integration costs for healthcare systems.

---

## 🏥 Problem Statement

- **Complexity of HL7**: HL7 v2 is the backbone of healthcare interoperability, but its structure is highly technical and difficult for non-technical users to interpret.  
- **Cost of Integration**: Hospitals spend significant resources on interface engines and consultants to manage HL7 data.  
- **Workflow Inefficiencies**: Patient intake and discharge involve multiple handoffs, resulting in delays, redundant data entry, and errors.  
- **Accessibility Gap**: Non-technical healthcare staff cannot easily read, update, or act on HL7 data without IT involvement.  

---

## 💡 Solution

HL7 LiteBoard provides a simplified interface that:

- **Ingests** HL7 v2 messages (e.g., ADT for admissions, ORU for labs).  
- **Transforms** and displays patient information in an intuitive dashboard.  
- **Enables** real-time edits to key fields (allergies, medications, discharge notes).  
- **Generates** updated HL7/FHIR messages to maintain interoperability.  
- **Provides** one-click export in PDF, JSON, or XML formats for easy sharing and record-keeping.  

This system acts as a translation and interaction layer between hospital systems and healthcare professionals, improving usability without requiring deep technical expertise.

---

## 📋 System Overview

### Core Components
- **FastAPI Backend** (Port 8000) – HL7 processing API with comprehensive endpoints  
- **PostgreSQL Database** (Port 5432) – HL7 schema with audit trails  
- **Mock Mastra Service** (Port 3001) – AI agent simulation for format conversion  
- **pgAdmin** (Port 8080) – Database management interface  

### Optional Components (via profiles)
- **Prometheus** (Port 9090) – Metrics collection  
- **Grafana** (Port 3000) – Dashboards and visualization  
- **React Frontend** (Port 80) – Web UI (future)  

---

## 🏗️ Architecture

```

HL7 File Upload → FastAPI → Database Storage → Mastra AI → Multi-format Output
↓              ↓            ↓              ↓            ↓
Validation    Processing    PostgreSQL   XML/JSON/PDF   Frontend Access

````

LiteBoard also acts as middleware:  
1. **Receives** HL7 v2 messages from hospital systems  
2. **Parses** and transforms data into structured JSON  
3. **Presents** information via a web interface  
4. **Captures** clinician updates and modifications  
5. **Generates** updated HL7/FHIR messages for system integration  

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/hl7-liteboard.git
cd hl7-liteboard
````

### Option 1: Development (Node.js frontend)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Option 2: Full System (Docker)

```bash
# Start core services
./start.sh

# Start with monitoring
./start.sh --monitoring

# Start everything
./start.sh --all
```

---

## 🧪 Testing

### Automated Testing

```bash
# Frontend unit tests
npm test

# API endpoint tests
./fastapi-backend/test-endpoints.sh
```

### Manual Tests

```bash
# Process all sample files
curl -X POST http://localhost:8000/api/v1/samples/process-all
```

---

## 📊 Access Points

* **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Health**: [http://localhost:8000/health](http://localhost:8000/health)
* **Database Admin**: [http://localhost:8080](http://localhost:8080) ([admin@hl7liteboard.com](mailto:admin@hl7liteboard.com) / admin123)
* **Mock Mastra**: [http://localhost:3001/health](http://localhost:3001/health)

---

## 🎯 Use Cases

* **Emergency Department**: Quick patient intake and updates
* **Laboratory Results**: Clean presentation of ORU messages
* **Patient Transfers**: Streamlined ADT message management
* **Discharge Planning**: Efficient preparation of discharge summaries

---

## 🔧 Development

### Project Structure

```
hl7-parse/
├── fastapi-backend/         # FastAPI application
│   ├── app/                # Application code
│   ├── sample_files/       # 4 realistic HL7 samples
│   ├── mock-mastra/        # Mock AI service
│   └── Dockerfile
├── docker-compose.yml
└── start.sh
```

### Sample HL7 Files

* **adt_admission.hl7** – Patient admission with allergies
* **oru_lab_results.hl7** – Laboratory results (CBC, metabolic panel)
* **orm_medication_order.hl7** – Medication orders
* **adt_discharge.hl7** – Patient discharge with procedures

### Features Implemented

✅ HL7 v2 parsing and validation
✅ Multi-format conversion (XML, JSON, PDF)
✅ Dashboard for real-time edits
✅ REST API with OpenAPI docs
✅ Database storage with full schema
✅ Metrics and monitoring support

---

## 🔒 Security

* Input validation & sanitization
* SQL injection prevention
* File size/type validation
* Error handling without leaks
* Env-based configuration

---

## 📈 Production Considerations

* Replace mock AI with real agents
* Add authentication/authorization
* Enable rate limiting & throttling
* Set up SSL/TLS
* Implement backups & monitoring

---

## 🤝 Contributing

* Extend HL7 models in `app/models/`
* Add API endpoints in `app/routers/`
* Add logic in `app/services/`
* Schema updates via Alembic migrations

---

## 📄 License

MIT License – free to use and improve for better healthcare workflows.

---

**Built for Better Healthcare Interoperability** 🏥✨
HL7 LiteBoard bridges the technical gap between healthcare systems and the clinicians who use them.

