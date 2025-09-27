"""
Format Retrieval Router
Handles retrieval of processed HL7 formats (XML, JSON, PDF)
"""

import uuid
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from io import BytesIO
import tempfile
import os

from app.database.database import get_db
from app.database.models import HL7Message
from app.models.hl7_models import (
    FormatResponse, 
    OutputFormat,
    DownloadResponse
)

router = APIRouter()

@router.get("/formats/{message_id}", response_model=Dict[str, Any])
async def get_all_formats(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all available formats for a processed HL7 message
    """
    try:
        # Query the message
        result = await db.execute(
            select(HL7Message).where(HL7Message.id == message_id)
        )
        message = result.scalar_one_or_none()
        
        if not message:
            raise HTTPException(
                status_code=404,
                detail=f"Message with ID {message_id} not found"
            )
        
        # Build response with available formats
        available_formats = []
        formats_data = {}
        
        if message.xml_content:
            available_formats.append("xml")
            formats_data["xml"] = {
                "available": True,
                "size": len(message.xml_content),
                "content_type": "application/xml"
            }
        
        if message.json_content:
            available_formats.append("json")
            formats_data["json"] = {
                "available": True,
                "size": len(str(message.json_content)),
                "content_type": "application/json"
            }
        
        if message.pdf_content:
            available_formats.append("pdf")
            formats_data["pdf"] = {
                "available": True,
                "size": len(message.pdf_content),
                "content_type": "application/pdf"
            }
        
        return {
            "message_id": str(message_id),
            "original_filename": message.original_filename,
            "message_type": message.message_type,
            "processing_status": message.processing_status,
            "processed_at": message.processed_at.isoformat() if message.processed_at else None,
            "available_formats": available_formats,
            "formats": formats_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving formats: {str(e)}"
        )

@router.get("/formats/{message_id}/xml")
async def get_xml_format(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get XML format of processed HL7 message
    """
    try:
        result = await db.execute(
            select(HL7Message.xml_content, HL7Message.original_filename)
            .where(HL7Message.id == message_id)
        )
        row = result.first()
        
        if not row:
            raise HTTPException(
                status_code=404,
                detail=f"Message with ID {message_id} not found"
            )
        
        xml_content, filename = row
        
        if not xml_content:
            raise HTTPException(
                status_code=404,
                detail="XML format not available for this message"
            )
        
        return Response(
            content=xml_content,
            media_type="application/xml",
            headers={
                "Content-Disposition": f"inline; filename=\"{_get_format_filename(filename, 'xml')}\""
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving XML format: {str(e)}"
        )

@router.get("/formats/{message_id}/json")
async def get_json_format(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get JSON format of processed HL7 message
    """
    try:
        result = await db.execute(
            select(HL7Message.json_content, HL7Message.original_filename)
            .where(HL7Message.id == message_id)
        )
        row = result.first()
        
        if not row:
            raise HTTPException(
                status_code=404,
                detail=f"Message with ID {message_id} not found"
            )
        
        json_content, filename = row
        
        if not json_content:
            raise HTTPException(
                status_code=404,
                detail="JSON format not available for this message"
            )
        
        return JSONResponse(
            content=json_content,
            headers={
                "Content-Disposition": f"inline; filename=\"{_get_format_filename(filename, 'json')}\""
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving JSON format: {str(e)}"
        )

@router.get("/formats/{message_id}/pdf")
async def get_pdf_format(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get PDF format of processed HL7 message
    """
    try:
        result = await db.execute(
            select(HL7Message.pdf_content, HL7Message.original_filename)
            .where(HL7Message.id == message_id)
        )
        row = result.first()
        
        if not row:
            raise HTTPException(
                status_code=404,
                detail=f"Message with ID {message_id} not found"
            )
        
        pdf_content, filename = row
        
        if not pdf_content:
            raise HTTPException(
                status_code=404,
                detail="PDF format not available for this message"
            )
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename=\"{_get_format_filename(filename, 'pdf')}\""
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving PDF format: {str(e)}"
        )

@router.get("/download/{message_id}/{format}")
async def download_format(
    message_id: uuid.UUID,
    format: OutputFormat,
    db: AsyncSession = Depends(get_db)
):
    """
    Download a specific format as an attachment
    """
    try:
        result = await db.execute(
            select(HL7Message).where(HL7Message.id == message_id)
        )
        message = result.scalar_one_or_none()
        
        if not message:
            raise HTTPException(
                status_code=404,
                detail=f"Message with ID {message_id} not found"
            )
        
        content = None
        content_type = None
        
        if format == OutputFormat.XML and message.xml_content:
            content = message.xml_content.encode('utf-8')
            content_type = "application/xml"
        elif format == OutputFormat.JSON and message.json_content:
            import json
            content = json.dumps(message.json_content, indent=2).encode('utf-8')
            content_type = "application/json"
        elif format == OutputFormat.PDF and message.pdf_content:
            content = message.pdf_content
            content_type = "application/pdf"
        
        if not content:
            raise HTTPException(
                status_code=404,
                detail=f"{format.value.upper()} format not available for this message"
            )
        
        filename = _get_format_filename(message.original_filename, format.value)
        
        return Response(
            content=content,
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename=\"{filename}\""
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error downloading format: {str(e)}"
        )

@router.get("/formats/{message_id}/raw")
async def get_raw_hl7(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get the original raw HL7 message content
    """
    try:
        result = await db.execute(
            select(HL7Message.raw_hl7_content, HL7Message.original_filename)
            .where(HL7Message.id == message_id)
        )
        row = result.first()
        
        if not row:
            raise HTTPException(
                status_code=404,
                detail=f"Message with ID {message_id} not found"
            )
        
        raw_content, filename = row
        
        return Response(
            content=raw_content,
            media_type="text/plain",
            headers={
                "Content-Disposition": f"inline; filename=\"{filename}\""
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving raw HL7: {str(e)}"
        )

def _get_format_filename(original_filename: str, format_type: str) -> str:
    """
    Generate filename for a specific format
    """
    if not original_filename:
        original_filename = "hl7_message"
    
    # Remove original extension
    name_without_ext = os.path.splitext(original_filename)[0]
    
    # Add format extension
    return f"{name_without_ext}.{format_type}"