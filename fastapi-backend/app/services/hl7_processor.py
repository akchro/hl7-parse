"""
HL7 Processing Service
Handles HL7 parsing, database operations, and coordination
"""

import uuid
import re
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError

from app.database.models import HL7Message, ProcessingLog, PatientData, VisitData, ObservationData, AllergyData
from app.models.hl7_models import ProcessingStatus, MessageType
from app.utils.data_escape import hl7_processor as data_processor
import logging

logger = logging.getLogger(__name__)

class HL7Processor:
    """Service for processing HL7 messages and managing database operations"""
    
    def __init__(self):
        pass
    
    def extract_basic_info(self, hl7_content: str) -> Dict[str, Any]:
        """
        Extract basic information from HL7 message without full parsing
        """
        try:
            lines = hl7_content.strip().split('\n')
            msh_line = lines[0] if lines else ""
            
            if not msh_line.startswith("MSH"):
                return {"message_type": "Unknown", "patient_id": None}
            
            # Extract encoding characters
            data_processor.extract_encoding_chars(msh_line)
            
            # Extract message type from MSH.9
            msh_fields = msh_line.split(data_processor.field_separator)
            message_type = "Unknown"
            trigger_event = None
            
            if len(msh_fields) > 8:
                message_type_field = msh_fields[8]  # MSH.9
                components = data_processor.split_field_components(message_type_field)
                if components:
                    message_type = components[0]
                if len(components) > 1:
                    trigger_event = components[1]
            
            # Try to find patient ID from PID segment
            patient_id = None
            for line in lines:
                if line.startswith("PID"):
                    patient_id = self._extract_patient_id_from_pid(line)
                    break
            
            return {
                "message_type": message_type,
                "trigger_event": trigger_event,
                "patient_id": patient_id
            }
            
        except Exception as e:
            logger.error(f"Error extracting basic info from HL7: {e}")
            return {"message_type": "Unknown", "patient_id": None}
    
    def _extract_patient_id_from_pid(self, pid_line: str) -> Optional[str]:
        """Extract patient ID from PID segment"""
        try:
            fields = pid_line.split(data_processor.field_separator)
            if len(fields) > 3:
                # PID.3 contains patient identifiers
                return data_processor.extract_identifier(fields[3])
            return None
        except Exception:
            return None
    
    async def save_message_to_db(
        self,
        db: AsyncSession,
        message_id: uuid.UUID,
        filename: str,
        content: str,
        message_type: str,
        patient_id: Optional[str] = None
    ) -> HL7Message:
        """
        Save HL7 message to database
        """
        try:
            # Parse additional patient info if available
            patient_info = self._extract_patient_demographics(content)
            visit_info = self._extract_visit_info(content)
            
            db_message = HL7Message(
                id=message_id,
                original_filename=filename,
                raw_hl7_content=content,
                message_type=message_type,
                patient_id=patient_id,
                processing_status=ProcessingStatus.PENDING.value,
                processed_at=datetime.utcnow(),
                patient_first_name=patient_info.get("first_name"),
                patient_last_name=patient_info.get("last_name"),
                patient_dob=patient_info.get("date_of_birth"),
                patient_gender=patient_info.get("gender"),
                visit_number=visit_info.get("visit_number"),
                admission_date=visit_info.get("admission_date"),
                discharge_date=visit_info.get("discharge_date")
            )
            
            db.add(db_message)
            await db.commit()
            await db.refresh(db_message)
            
            return db_message
            
        except SQLAlchemyError as e:
            await db.rollback()
            logger.error(f"Database error saving message: {e}")
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"Error saving message to database: {e}")
            raise
    
    async def save_processed_formats(
        self,
        db: AsyncSession,
        message_id: uuid.UUID,
        xml_content: Optional[str] = None,
        json_content: Optional[Dict[str, Any]] = None,
        pdf_content: Optional[bytes] = None
    ):
        """
        Save processed formats to database
        """
        try:
            update_data = {}
            
            if xml_content:
                update_data["xml_content"] = xml_content
            
            if json_content:
                update_data["json_content"] = json_content
            
            if pdf_content:
                update_data["pdf_content"] = pdf_content
            
            if update_data:
                await db.execute(
                    update(HL7Message)
                    .where(HL7Message.id == message_id)
                    .values(**update_data)
                )
                await db.commit()
            
        except SQLAlchemyError as e:
            await db.rollback()
            logger.error(f"Database error saving processed formats: {e}")
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"Error saving processed formats: {e}")
            raise
    
    async def update_processing_status(
        self,
        db: AsyncSession,
        message_id: uuid.UUID,
        status: ProcessingStatus
    ):
        """
        Update processing status for a message
        """
        try:
            await db.execute(
                update(HL7Message)
                .where(HL7Message.id == message_id)
                .values(processing_status=status.value)
            )
            await db.commit()
            
        except SQLAlchemyError as e:
            await db.rollback()
            logger.error(f"Database error updating status: {e}")
            raise
    
    async def log_processing_error(
        self,
        db: AsyncSession,
        message_id: uuid.UUID,
        error_message: str,
        agent_name: Optional[str] = None,
        processing_step: Optional[str] = None
    ):
        """
        Log processing error to database
        """
        try:
            log_entry = ProcessingLog(
                id=uuid.uuid4(),
                message_id=message_id,
                agent_name=agent_name or "Unknown",
                processing_step=processing_step or "Unknown",
                status="error",
                error_message=error_message,
                created_at=datetime.utcnow()
            )
            
            db.add(log_entry)
            await db.commit()
            
        except SQLAlchemyError as e:
            await db.rollback()
            logger.error(f"Database error logging processing error: {e}")
        except Exception as e:
            logger.error(f"Error logging processing error: {e}")
    
    async def get_processing_status(
        self,
        db: AsyncSession,
        message_id: uuid.UUID
    ) -> Optional[Dict[str, Any]]:
        """
        Get processing status for a message
        """
        try:
            result = await db.execute(
                select(HL7Message.processing_status, HL7Message.processed_at)
                .where(HL7Message.id == message_id)
            )
            row = result.first()
            
            if not row:
                return None
            
            status, processed_at = row
            
            # Calculate progress percentage
            progress = 0
            current_step = None
            
            if status == ProcessingStatus.PENDING.value:
                progress = 10
                current_step = "Queued for processing"
            elif status == ProcessingStatus.PROCESSING.value:
                progress = 50
                current_step = "Converting formats"
            elif status == ProcessingStatus.COMPLETED.value:
                progress = 100
                current_step = "Completed"
            elif status == ProcessingStatus.FAILED.value:
                progress = 0
                current_step = "Failed"
            elif status == ProcessingStatus.PARTIAL.value:
                progress = 75
                current_step = "Partially completed"
            
            return {
                "message_id": message_id,
                "status": status,
                "progress": progress,
                "current_step": current_step,
                "error_message": None
            }
            
        except Exception as e:
            logger.error(f"Error getting processing status: {e}")
            return None
    
    def _extract_patient_demographics(self, hl7_content: str) -> Dict[str, Any]:
        """
        Extract patient demographic information from HL7
        """
        patient_info = {}
        
        try:
            lines = hl7_content.strip().split('\n')
            
            for line in lines:
                if line.startswith("PID"):
                    fields = line.split(data_processor.field_separator)
                    
                    # PID.5 - Patient Name
                    if len(fields) > 5:
                        name_info = data_processor.clean_patient_name(fields[5])
                        patient_info.update(name_info)
                    
                    # PID.7 - Date of Birth
                    if len(fields) > 7:
                        dob_str = data_processor.normalize_field(fields[7])
                        if dob_str:
                            try:
                                # HL7 date format: YYYYMMDD
                                if len(dob_str) >= 8:
                                    dob = datetime.strptime(dob_str[:8], "%Y%m%d")
                                    patient_info["date_of_birth"] = dob
                            except ValueError:
                                pass
                    
                    # PID.8 - Gender
                    if len(fields) > 8:
                        gender = data_processor.normalize_field(fields[8])
                        if gender:
                            patient_info["gender"] = gender[0].upper() if gender else None
                    
                    break
                    
        except Exception as e:
            logger.error(f"Error extracting patient demographics: {e}")
        
        return patient_info
    
    def _extract_visit_info(self, hl7_content: str) -> Dict[str, Any]:
        """
        Extract visit information from HL7
        """
        visit_info = {}
        
        try:
            lines = hl7_content.strip().split('\n')
            
            for line in lines:
                if line.startswith("PV1"):
                    fields = line.split(data_processor.field_separator)
                    
                    # PV1.19 - Visit Number
                    if len(fields) > 19:
                        visit_number = data_processor.normalize_field(fields[19])
                        if visit_number:
                            visit_info["visit_number"] = visit_number
                    
                    # PV1.44 - Admit Date/Time
                    if len(fields) > 44:
                        admit_date_str = data_processor.normalize_field(fields[44])
                        if admit_date_str:
                            try:
                                # HL7 timestamp format: YYYYMMDDHHMMSS
                                if len(admit_date_str) >= 8:
                                    admit_date = datetime.strptime(admit_date_str[:14], "%Y%m%d%H%M%S")
                                    visit_info["admission_date"] = admit_date
                            except ValueError:
                                pass
                    
                    # PV1.45 - Discharge Date/Time
                    if len(fields) > 45:
                        discharge_date_str = data_processor.normalize_field(fields[45])
                        if discharge_date_str:
                            try:
                                if len(discharge_date_str) >= 8:
                                    discharge_date = datetime.strptime(discharge_date_str[:14], "%Y%m%d%H%M%S")
                                    visit_info["discharge_date"] = discharge_date
                            except ValueError:
                                pass
                    
                    break
                    
        except Exception as e:
            logger.error(f"Error extracting visit info: {e}")
        
        return visit_info