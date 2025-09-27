"""
HL7 File Upload Router
Handles file uploads and processing initiation
"""

import uuid
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.models.hl7_models import (
    HL7UploadResponse, 
    ProcessingStatusResponse, 
    ProcessingStatus,
    MessageType
)
from app.services.hl7_processor import HL7Processor
from app.services.mastra_service import MastraService
from app.utils.file_handler import file_handler
from app.config import settings

router = APIRouter()
hl7_processor = HL7Processor()
mastra_service = MastraService()

@router.post("/upload/hl7", response_model=HL7UploadResponse)
async def upload_hl7_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="HL7 file to upload"),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload an HL7 file for processing
    """
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    if file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE} bytes"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Decode content
        try:
            hl7_content = content.decode('utf-8')
        except UnicodeDecodeError:
            hl7_content = content.decode('latin-1')
        
        # Validate HL7 format
        if not file_handler.is_valid_hl7_file(hl7_content):
            raise HTTPException(
                status_code=400, 
                detail="Invalid HL7 file format. File must start with MSH segment."
            )
        
        # Generate message ID
        message_id = uuid.uuid4()
        
        # Extract basic info from HL7
        message_info = hl7_processor.extract_basic_info(hl7_content)
        
        # Save to database
        db_message = await hl7_processor.save_message_to_db(
            db=db,
            message_id=message_id,
            filename=file.filename,
            content=hl7_content,
            message_type=message_info.get('message_type', 'Unknown'),
            patient_id=message_info.get('patient_id')
        )
        
        # Schedule background processing
        background_tasks.add_task(
            process_hl7_message,
            message_id=message_id,
            hl7_content=hl7_content,
            db_session=db
        )
        
        return HL7UploadResponse(
            message_id=message_id,
            filename=file.filename,
            status=ProcessingStatus.PENDING,
            message=f"File '{file.filename}' uploaded successfully. Processing started."
        )
        
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Could not decode file. Please ensure it's a valid text file."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing upload: {str(e)}"
        )

@router.post("/upload/hl7/text", response_model=HL7UploadResponse)
async def upload_hl7_text(
    background_tasks: BackgroundTasks,
    hl7_content: str,
    filename: str = "pasted_message.hl7",
    db: AsyncSession = Depends(get_db)
):
    """
    Upload HL7 content as text
    """
    # Validate HL7 format
    if not file_handler.is_valid_hl7_file(hl7_content):
        raise HTTPException(
            status_code=400,
            detail="Invalid HL7 format. Content must start with MSH segment."
        )
    
    try:
        # Generate message ID
        message_id = uuid.uuid4()
        
        # Extract basic info from HL7
        message_info = hl7_processor.extract_basic_info(hl7_content)
        
        # Save to database
        db_message = await hl7_processor.save_message_to_db(
            db=db,
            message_id=message_id,
            filename=filename,
            content=hl7_content,
            message_type=message_info.get('message_type', 'Unknown'),
            patient_id=message_info.get('patient_id')
        )
        
        # Schedule background processing
        background_tasks.add_task(
            process_hl7_message,
            message_id=message_id,
            hl7_content=hl7_content,
            db_session=db
        )
        
        return HL7UploadResponse(
            message_id=message_id,
            filename=filename,
            status=ProcessingStatus.PENDING,
            message="HL7 content uploaded successfully. Processing started."
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing HL7 text: {str(e)}"
        )

@router.get("/upload/status/{message_id}", response_model=ProcessingStatusResponse)
async def get_processing_status(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get processing status for an uploaded message
    """
    try:
        status_info = await hl7_processor.get_processing_status(db, message_id)
        
        if not status_info:
            raise HTTPException(
                status_code=404,
                detail=f"Message with ID {message_id} not found"
            )
        
        return ProcessingStatusResponse(**status_info)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving status: {str(e)}"
        )

@router.post("/upload/batch", response_model=List[HL7UploadResponse])
async def upload_multiple_hl7_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(..., description="Multiple HL7 files to upload"),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload multiple HL7 files for batch processing
    """
    if len(files) > 10:  # Limit batch size
        raise HTTPException(
            status_code=400,
            detail="Too many files. Maximum 10 files per batch upload."
        )
    
    responses = []
    
    for file in files:
        try:
            # Process each file similar to single upload
            content = await file.read()
            
            try:
                hl7_content = content.decode('utf-8')
            except UnicodeDecodeError:
                hl7_content = content.decode('latin-1')
            
            if not file_handler.is_valid_hl7_file(hl7_content):
                responses.append(HL7UploadResponse(
                    message_id=uuid.uuid4(),
                    filename=file.filename or "unknown",
                    status=ProcessingStatus.FAILED,
                    message=f"Invalid HL7 format in file {file.filename}"
                ))
                continue
            
            # Generate message ID
            message_id = uuid.uuid4()
            
            # Extract basic info
            message_info = hl7_processor.extract_basic_info(hl7_content)
            
            # Save to database
            await hl7_processor.save_message_to_db(
                db=db,
                message_id=message_id,
                filename=file.filename or f"batch_file_{len(responses)}.hl7",
                content=hl7_content,
                message_type=message_info.get('message_type', 'Unknown'),
                patient_id=message_info.get('patient_id')
            )
            
            # Schedule processing
            background_tasks.add_task(
                process_hl7_message,
                message_id=message_id,
                hl7_content=hl7_content,
                db_session=db
            )
            
            responses.append(HL7UploadResponse(
                message_id=message_id,
                filename=file.filename or f"batch_file_{len(responses)}.hl7",
                status=ProcessingStatus.PENDING,
                message="File queued for processing"
            ))
            
        except Exception as e:
            responses.append(HL7UploadResponse(
                message_id=uuid.uuid4(),
                filename=file.filename or "unknown",
                status=ProcessingStatus.FAILED,
                message=f"Error processing file: {str(e)}"
            ))
    
    return responses

async def process_hl7_message(
    message_id: uuid.UUID,
    hl7_content: str,
    db_session: AsyncSession
):
    """
    Background task to process HL7 message with Mastra agents
    """
    try:
        # Update status to processing
        await hl7_processor.update_processing_status(
            db_session, message_id, ProcessingStatus.PROCESSING
        )
        
        # Process with Mastra agents
        results = await mastra_service.process_hl7_message(hl7_content)
        
        # Save results to database
        await hl7_processor.save_processed_formats(
            db_session,
            message_id,
            xml_content=results.get('xml'),
            json_content=results.get('json'),
            pdf_content=results.get('pdf')
        )
        
        # Update status to completed
        await hl7_processor.update_processing_status(
            db_session, message_id, ProcessingStatus.COMPLETED
        )
        
    except Exception as e:
        # Log error and update status
        await hl7_processor.log_processing_error(
            db_session, message_id, str(e)
        )
        await hl7_processor.update_processing_status(
            db_session, message_id, ProcessingStatus.FAILED
        )