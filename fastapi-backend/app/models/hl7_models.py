"""
Pydantic models for HL7 data structures
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field

class MessageType(str, Enum):
    """HL7 Message types"""
    ADT = "ADT"  # Admission, Discharge, Transfer
    ORU = "ORU"  # Observation Result
    ORM = "ORM"  # Order Message
    SIU = "SIU"  # Scheduling Information
    MDM = "MDM"  # Medical Document Management

class ProcessingStatus(str, Enum):
    """Processing status options"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"

class OutputFormat(str, Enum):
    """Available output formats"""
    XML = "xml"
    JSON = "json"
    PDF = "pdf"

# Request Models
class HL7UploadRequest(BaseModel):
    """Request model for HL7 file upload"""
    filename: str = Field(..., description="Original filename")
    content: str = Field(..., description="HL7 message content")

class ProcessSampleRequest(BaseModel):
    """Request model for processing sample files"""
    sample_filename: str = Field(..., description="Sample file to process")

# HL7 Data Models
class PatientInfo(BaseModel):
    """Patient demographic information from PID segment"""
    patient_id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    ssn: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    marital_status: Optional[str] = None
    race: Optional[str] = None
    ethnicity: Optional[str] = None

class VisitInfo(BaseModel):
    """Visit information from PV1 segment"""
    visit_number: Optional[str] = None
    patient_class: Optional[str] = None
    assigned_location: Optional[str] = None
    admission_type: Optional[str] = None
    attending_doctor: Optional[str] = None
    referring_doctor: Optional[str] = None
    room_bed: Optional[str] = None
    admission_date: Optional[datetime] = None
    discharge_date: Optional[datetime] = None

class ObservationResult(BaseModel):
    """Observation/Lab result from OBX segment"""
    observation_id: Optional[str] = None
    value_type: Optional[str] = None
    observation_identifier: Optional[str] = None
    observation_value: Optional[str] = None
    units: Optional[str] = None
    reference_range: Optional[str] = None
    abnormal_flags: Optional[str] = None
    observation_date: Optional[datetime] = None

class ParsedHL7Data(BaseModel):
    """Complete parsed HL7 message data"""
    message_type: MessageType
    trigger_event: Optional[str] = None
    sending_application: Optional[str] = None
    receiving_application: Optional[str] = None
    message_timestamp: Optional[datetime] = None
    patient_info: Optional[PatientInfo] = None
    visit_info: Optional[VisitInfo] = None
    observations: List[ObservationResult] = []
    raw_segments: Dict[str, List[str]] = {}

# Database Models
class HL7MessageDB(BaseModel):
    """Database model for HL7 messages"""
    id: UUID
    original_filename: str
    raw_hl7_content: str
    message_type: MessageType
    patient_id: Optional[str] = None
    processed_at: datetime
    xml_content: Optional[str] = None
    json_content: Optional[Dict[str, Any]] = None
    pdf_content: Optional[bytes] = None
    processing_status: ProcessingStatus
    parsed_data: Optional[ParsedHL7Data] = None

class ProcessingLog(BaseModel):
    """Processing log entry"""
    id: UUID
    message_id: UUID
    agent_name: str
    processing_step: str
    status: ProcessingStatus
    error_message: Optional[str] = None
    created_at: datetime

# Response Models
class HL7UploadResponse(BaseModel):
    """Response for HL7 upload"""
    message_id: UUID
    filename: str
    status: ProcessingStatus
    message: str

class ProcessingStatusResponse(BaseModel):
    """Processing status response"""
    message_id: UUID
    status: ProcessingStatus
    progress: int = Field(..., ge=0, le=100, description="Progress percentage")
    current_step: Optional[str] = None
    error_message: Optional[str] = None

class FormatResponse(BaseModel):
    """Response for format retrieval"""
    message_id: UUID
    format: OutputFormat
    content: str
    content_type: str
    filename: str

class MessageSummary(BaseModel):
    """Summary of processed message"""
    id: UUID
    original_filename: str
    message_type: MessageType
    patient_id: Optional[str] = None
    processed_at: datetime
    status: ProcessingStatus
    available_formats: List[OutputFormat] = []
    patient_name: Optional[str] = None

class BrowseResponse(BaseModel):
    """Response for browsing messages"""
    messages: List[MessageSummary]
    total: int
    page: int
    page_size: int
    has_next: bool

class SampleFileInfo(BaseModel):
    """Information about sample HL7 files"""
    filename: str
    description: str
    message_type: MessageType
    file_size: int
    last_modified: datetime

class DownloadResponse(BaseModel):
    """Response for file downloads"""
    filename: str
    content_type: str
    content_length: int