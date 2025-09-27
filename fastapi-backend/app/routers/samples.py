"""
Sample Files Router
Handles sample HL7 file listing and processing
"""

import uuid
from typing import List
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.models.hl7_models import (
    SampleFileInfo,
    HL7UploadResponse,
    ProcessingStatus,
    ProcessSampleRequest
)
from app.services.hl7_processor import HL7Processor
from app.services.mastra_service import MastraService
from app.utils.file_handler import file_handler

router = APIRouter()
hl7_processor = HL7Processor()
mastra_service = MastraService()

@router.get("/samples", response_model=List[SampleFileInfo])
async def list_sample_files():
    """
    Get list of available sample HL7 files
    """
    try:
        sample_files = file_handler.list_sample_files()
        
        return [
            SampleFileInfo(
                filename=file_info["filename"],
                description=file_info["description"],
                message_type=file_info["message_type"],
                file_size=file_info["file_size"],
                last_modified=file_info["last_modified"]
            )
            for file_info in sample_files
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing sample files: {str(e)}"
        )

@router.post("/samples/process", response_model=HL7UploadResponse)
async def process_sample_file(
    background_tasks: BackgroundTasks,
    request: ProcessSampleRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Process a sample HL7 file
    """
    try:
        # Read sample file
        filename, hl7_content = await file_handler.read_sample_file(request.sample_filename)
        
        # Generate message ID
        message_id = uuid.uuid4()
        
        # Extract basic info from HL7
        message_info = hl7_processor.extract_basic_info(hl7_content)
        
        # Save to database
        db_message = await hl7_processor.save_message_to_db(
            db=db,
            message_id=message_id,
            filename=f"sample_{filename}",
            content=hl7_content,
            message_type=message_info.get('message_type', 'Unknown'),
            patient_id=message_info.get('patient_id')
        )
        
        # Schedule background processing
        background_tasks.add_task(
            process_sample_hl7_message,
            message_id=message_id,
            hl7_content=hl7_content,
            db_session=db
        )
        
        return HL7UploadResponse(
            message_id=message_id,
            filename=f"sample_{filename}",
            status=ProcessingStatus.PENDING,
            message=f"Sample file '{filename}' processing started."
        )
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Sample file '{request.sample_filename}' not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing sample file: {str(e)}"
        )

@router.get("/samples/{filename}/content")
async def get_sample_file_content(filename: str):
    """
    Get the raw content of a sample HL7 file
    """
    try:
        _, content = await file_handler.read_sample_file(filename)
        
        return {
            "filename": filename,
            "content": content,
            "lines": len(content.split('\n')),
            "size": len(content)
        }
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Sample file '{filename}' not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading sample file: {str(e)}"
        )

@router.post("/samples/process-all", response_model=List[HL7UploadResponse])
async def process_all_sample_files(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Process all available sample HL7 files
    """
    try:
        sample_files = file_handler.list_sample_files()
        responses = []
        
        for file_info in sample_files:
            try:
                # Read sample file
                filename, hl7_content = await file_handler.read_sample_file(file_info["filename"])
                
                # Generate message ID
                message_id = uuid.uuid4()
                
                # Extract basic info from HL7
                message_info = hl7_processor.extract_basic_info(hl7_content)
                
                # Save to database
                await hl7_processor.save_message_to_db(
                    db=db,
                    message_id=message_id,
                    filename=f"sample_{filename}",
                    content=hl7_content,
                    message_type=message_info.get('message_type', 'Unknown'),
                    patient_id=message_info.get('patient_id')
                )
                
                # Schedule processing
                background_tasks.add_task(
                    process_sample_hl7_message,
                    message_id=message_id,
                    hl7_content=hl7_content,
                    db_session=db
                )
                
                responses.append(HL7UploadResponse(
                    message_id=message_id,
                    filename=f"sample_{filename}",
                    status=ProcessingStatus.PENDING,
                    message=f"Sample file '{filename}' queued for processing"
                ))
                
            except Exception as e:
                responses.append(HL7UploadResponse(
                    message_id=uuid.uuid4(),
                    filename=f"sample_{file_info['filename']}",
                    status=ProcessingStatus.FAILED,
                    message=f"Error processing sample file: {str(e)}"
                ))
        
        return responses
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing sample files: {str(e)}"
        )

@router.get("/samples/{filename}/info", response_model=SampleFileInfo)
async def get_sample_file_info(filename: str):
    """
    Get detailed information about a specific sample file
    """
    try:
        sample_files = file_handler.list_sample_files()
        
        # Find the specific file
        file_info = next(
            (f for f in sample_files if f["filename"] == filename),
            None
        )
        
        if not file_info:
            raise HTTPException(
                status_code=404,
                detail=f"Sample file '{filename}' not found"
            )
        
        return SampleFileInfo(
            filename=file_info["filename"],
            description=file_info["description"],
            message_type=file_info["message_type"],
            file_size=file_info["file_size"],
            last_modified=file_info["last_modified"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting sample file info: {str(e)}"
        )

async def process_sample_hl7_message(
    message_id: uuid.UUID,
    hl7_content: str,
    db_session: AsyncSession
):
    """
    Background task to process sample HL7 message with Mastra agents
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