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