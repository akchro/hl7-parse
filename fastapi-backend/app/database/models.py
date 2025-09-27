"""
SQLAlchemy database models for HL7 LiteBoard
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, LargeBinary, Integer, ForeignKey, Index, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class HL7Message(Base):
    """Table for storing processed HL7 messages"""
    __tablename__ = "hl7_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_filename = Column(String(255), nullable=False)
    raw_hl7_content = Column(Text, nullable=False)
    message_type = Column(String(10), nullable=False)  # ADT, ORU, ORM, etc.
    trigger_event = Column(String(10))  # A01, A02, R01, etc.
    patient_id = Column(String(50))
    
    # Processed formats
    xml_content = Column(Text)
    json_content = Column(JSONB)
    pdf_content = Column(LargeBinary)
    
    # Processing metadata
    processing_status = Column(String(20), default="pending")  # pending, processing, completed, failed, partial
    processed_at = Column(DateTime, default=datetime.utcnow)
    
    # Parsed data (structured)
    parsed_data = Column(JSONB)
    
    # Patient information (denormalized for quick access)
    patient_first_name = Column(String(100))
    patient_last_name = Column(String(100))
    patient_dob = Column(DateTime)
    patient_gender = Column(String(1))
    
    # Visit information
    visit_number = Column(String(50))
    admission_date = Column(DateTime)
    discharge_date = Column(DateTime)
    
    # Relationships
    processing_logs = relationship("ProcessingLog", back_populates="message", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<HL7Message(id={self.id}, filename='{self.original_filename}', type='{self.message_type}')>"

class ProcessingLog(Base):
    """Table for storing processing logs and errors"""
    __tablename__ = "processing_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("hl7_messages.id"), nullable=False)
    
    # Processing details
    agent_name = Column(String(50))  # Which Mastra agent processed this
    processing_step = Column(String(100))  # What step was being performed
    status = Column(String(20), nullable=False)  # success, error, warning
    
    # Error information
    error_message = Column(Text)
    error_details = Column(JSONB)
    
    # Timing
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    message = relationship("HL7Message", back_populates="processing_logs")
    
    def __repr__(self):
        return f"<ProcessingLog(id={self.id}, message_id={self.message_id}, status='{self.status}')>"

class PatientData(Base):
    """Table for storing extracted patient data"""
    __tablename__ = "patient_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("hl7_messages.id"), nullable=False)
    
    # Patient identifiers
    patient_id = Column(String(50))
    mrn = Column(String(50))  # Medical Record Number
    ssn = Column(String(11))
    
    # Demographics
    first_name = Column(String(100))
    last_name = Column(String(100))
    middle_name = Column(String(100))
    date_of_birth = Column(DateTime)
    gender = Column(String(1))
    race = Column(String(100))
    ethnicity = Column(String(100))
    marital_status = Column(String(20))
    
    # Contact information
    address_line1 = Column(String(200))
    address_line2 = Column(String(200))
    city = Column(String(100))
    state = Column(String(50))
    zip_code = Column(String(20))
    country = Column(String(50))
    phone_home = Column(String(20))
    phone_work = Column(String(20))
    phone_mobile = Column(String(20))
    email = Column(String(255))
    
    # Emergency contact
    emergency_contact_name = Column(String(200))
    emergency_contact_relationship = Column(String(50))
    emergency_contact_phone = Column(String(20))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<PatientData(id={self.id}, name='{self.first_name} {self.last_name}')>"

class VisitData(Base):
    """Table for storing visit/encounter data"""
    __tablename__ = "visit_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("hl7_messages.id"), nullable=False)
    
    # Visit identifiers
    visit_number = Column(String(50))
    account_number = Column(String(50))
    
    # Visit details
    patient_class = Column(String(20))  # Inpatient, Outpatient, Emergency, etc.
    admission_type = Column(String(50))
    admission_date = Column(DateTime)
    discharge_date = Column(DateTime)
    
    # Location
    assigned_location = Column(String(100))
    room_number = Column(String(20))
    bed_number = Column(String(20))
    
    # Providers
    attending_doctor = Column(String(200))
    referring_doctor = Column(String(200))
    consulting_doctor = Column(String(200))
    
    # Discharge information
    discharge_disposition = Column(String(100))
    discharge_location = Column(String(100))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<VisitData(id={self.id}, visit_number='{self.visit_number}')>"

class ObservationData(Base):
    """Table for storing lab results and observations"""
    __tablename__ = "observation_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("hl7_messages.id"), nullable=False)
    
    # Observation identifiers
    observation_id = Column(String(100))
    observation_set_id = Column(String(100))  # Groups related observations
    
    # Observation details
    value_type = Column(String(10))  # NM, ST, CE, etc.
    observation_identifier = Column(String(200))
    observation_name = Column(String(200))
    observation_value = Column(Text)
    units = Column(String(50))
    
    # Reference information
    reference_range = Column(String(100))
    abnormal_flags = Column(String(20))
    result_status = Column(String(10))  # F, P, R, C, etc.
    
    # Timing
    observation_date = Column(DateTime)
    collection_date = Column(DateTime)
    
    # Provider
    responsible_observer = Column(String(200))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<ObservationData(id={self.id}, name='{self.observation_name}', value='{self.observation_value}')>"

class AllergyData(Base):
    """Table for storing patient allergies"""
    __tablename__ = "allergy_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("hl7_messages.id"), nullable=False)
    
    # Allergy details
    allergen_type = Column(String(50))  # Drug, Food, Environmental, etc.
    allergen_code = Column(String(100))
    allergen_description = Column(String(200))
    
    # Reaction information
    allergy_severity = Column(String(20))  # Mild, Moderate, Severe, etc.
    allergy_reaction = Column(Text)
    allergy_type = Column(String(50))  # Allergy, Intolerance, etc.
    
    # Status
    allergy_status = Column(String(20), default="Active")  # Active, Inactive, etc.
    
    # Timing
    identification_date = Column(DateTime)
    onset_date = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<AllergyData(id={self.id}, allergen='{self.allergen_description}')>"

class SavedConversion(Base):
    """Table for storing user-saved conversion results"""
    __tablename__ = "saved_conversions"
    __table_args__ = (
        # Create a unique index on the hash of HL7 content to ensure uniqueness
        Index('ix_saved_conversions_original_hl7_content_hash', text('MD5(original_hl7_content)'), unique=True),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Original HL7 content (unique)
    original_hl7_content = Column(Text, nullable=False)
    
    # Converted formats
    json_content = Column(JSONB)
    xml_content = Column(Text)
    
    # Metadata
    conversion_metadata = Column(JSONB)  # Store metadata from both conversions
    
    # User identification (if auth is implemented later)
    user_id = Column(String(100))  # Optional for future auth implementation
    
    # Additional info
    title = Column(String(200))  # Optional title for the saved conversion
    description = Column(Text)   # Optional description
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<SavedConversion(id={self.id}, title='{self.title}', created_at='{self.created_at}')>"