"""
Browse Router
Handles browsing and searching processed HL7 messages
"""

import uuid
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import selectinload

from app.database.database import get_db
from app.database.models import HL7Message, ProcessingLog
from app.models.hl7_models import (
    BrowseResponse,
    MessageSummary,
    OutputFormat,
    ProcessingStatus,
    MessageType
)

router = APIRouter()

@router.get("/browse/messages", response_model=BrowseResponse)
async def browse_messages(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    message_type: Optional[MessageType] = Query(None, description="Filter by message type"),
    status: Optional[ProcessingStatus] = Query(None, description="Filter by processing status"),
    patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
    date_from: Optional[datetime] = Query(None, description="Filter from date"),
    date_to: Optional[datetime] = Query(None, description="Filter to date"),
    search: Optional[str] = Query(None, description="Search in filename or patient name"),
    sort_by: str = Query("processed_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Browse processed HL7 messages with filtering and pagination
    """
    try:
        # Build base query
        query = select(HL7Message)
        
        # Apply filters
        filters = []
        
        if message_type:
            filters.append(HL7Message.message_type == message_type)
        
        if status:
            filters.append(HL7Message.processing_status == status)
        
        if patient_id:
            filters.append(HL7Message.patient_id.ilike(f"%{patient_id}%"))
        
        if date_from:
            filters.append(HL7Message.processed_at >= date_from)
        
        if date_to:
            filters.append(HL7Message.processed_at <= date_to)
        
        if search:
            search_filter = or_(
                HL7Message.original_filename.ilike(f"%{search}%"),
                HL7Message.patient_first_name.ilike(f"%{search}%"),
                HL7Message.patient_last_name.ilike(f"%{search}%")
            )
            filters.append(search_filter)
        
        if filters:
            query = query.where(and_(*filters))
        
        # Apply sorting
        sort_column = getattr(HL7Message, sort_by, HL7Message.processed_at)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(sort_column)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await db.execute(count_query)
        total = count_result.scalar()
        
        # Apply pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        # Execute query
        result = await db.execute(query)
        messages = result.scalars().all()
        
        # Build response
        message_summaries = []
        for message in messages:
            available_formats = []
            if message.xml_content:
                available_formats.append(OutputFormat.XML)
            if message.json_content:
                available_formats.append(OutputFormat.JSON)
            if message.pdf_content:
                available_formats.append(OutputFormat.PDF)
            
            patient_name = None
            if message.patient_first_name or message.patient_last_name:
                first = message.patient_first_name or ""
                last = message.patient_last_name or ""
                patient_name = f"{first} {last}".strip()
            
            message_summaries.append(MessageSummary(
                id=message.id,
                original_filename=message.original_filename,
                message_type=MessageType(message.message_type),
                patient_id=message.patient_id,
                processed_at=message.processed_at,
                status=ProcessingStatus(message.processing_status),
                available_formats=available_formats,
                patient_name=patient_name
            ))
        
        return BrowseResponse(
            messages=message_summaries,
            total=total,
            page=page,
            page_size=page_size,
            has_next=offset + page_size < total
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error browsing messages: {str(e)}"
        )

@router.get("/browse/messages/{message_id}")
async def get_message_details(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific message
    """
    try:
        # Query message with processing logs
        result = await db.execute(
            select(HL7Message)
            .options(selectinload(HL7Message.processing_logs))
            .where(HL7Message.id == message_id)
        )
        message = result.scalar_one_or_none()
        
        if not message:
            raise HTTPException(
                status_code=404,
                detail=f"Message with ID {message_id} not found"
            )
        
        # Build available formats list
        available_formats = []
        if message.xml_content:
            available_formats.append("xml")
        if message.json_content:
            available_formats.append("json")
        if message.pdf_content:
            available_formats.append("pdf")
        
        # Get processing logs
        processing_logs = [
            {
                "id": str(log.id),
                "agent_name": log.agent_name,
                "processing_step": log.processing_step,
                "status": log.status,
                "error_message": log.error_message,
                "created_at": log.created_at.isoformat() if log.created_at else None,
                "duration_seconds": log.duration_seconds
            }
            for log in message.processing_logs
        ]
        
        return {
            "id": str(message.id),
            "original_filename": message.original_filename,
            "message_type": message.message_type,
            "trigger_event": message.trigger_event,
            "patient_id": message.patient_id,
            "patient_first_name": message.patient_first_name,
            "patient_last_name": message.patient_last_name,
            "patient_dob": message.patient_dob.isoformat() if message.patient_dob else None,
            "patient_gender": message.patient_gender,
            "visit_number": message.visit_number,
            "admission_date": message.admission_date.isoformat() if message.admission_date else None,
            "discharge_date": message.discharge_date.isoformat() if message.discharge_date else None,
            "processing_status": message.processing_status,
            "processed_at": message.processed_at.isoformat() if message.processed_at else None,
            "available_formats": available_formats,
            "parsed_data": message.parsed_data,
            "processing_logs": processing_logs,
            "raw_hl7_size": len(message.raw_hl7_content) if message.raw_hl7_content else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving message details: {str(e)}"
        )

@router.get("/browse/stats")
async def get_processing_stats(
    db: AsyncSession = Depends(get_db)
):
    """
    Get processing statistics and overview
    """
    try:
        # Total messages
        total_result = await db.execute(select(func.count(HL7Message.id)))
        total_messages = total_result.scalar()
        
        # Messages by status
        status_result = await db.execute(
            select(
                HL7Message.processing_status,
                func.count(HL7Message.id)
            ).group_by(HL7Message.processing_status)
        )
        status_counts = {status: count for status, count in status_result.all()}
        
        # Messages by type
        type_result = await db.execute(
            select(
                HL7Message.message_type,
                func.count(HL7Message.id)
            ).group_by(HL7Message.message_type)
        )
        type_counts = {msg_type: count for msg_type, count in type_result.all()}
        
        # Recent activity (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_result = await db.execute(
            select(func.count(HL7Message.id))
            .where(HL7Message.processed_at >= yesterday)
        )
        recent_count = recent_result.scalar()
        
        # Processing success rate
        completed_result = await db.execute(
            select(func.count(HL7Message.id))
            .where(HL7Message.processing_status == ProcessingStatus.COMPLETED)
        )
        completed_count = completed_result.scalar()
        
        success_rate = (completed_count / total_messages * 100) if total_messages > 0 else 0
        
        return {
            "total_messages": total_messages,
            "status_distribution": status_counts,
            "message_type_distribution": type_counts,
            "recent_activity_24h": recent_count,
            "success_rate_percentage": round(success_rate, 2),
            "completed_messages": completed_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving stats: {str(e)}"
        )

@router.get("/browse/search")
async def search_messages(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    db: AsyncSession = Depends(get_db)
):
    """
    Search messages by various fields
    """
    try:
        # Build search query
        search_filters = or_(
            HL7Message.original_filename.ilike(f"%{q}%"),
            HL7Message.patient_first_name.ilike(f"%{q}%"),
            HL7Message.patient_last_name.ilike(f"%{q}%"),
            HL7Message.patient_id.ilike(f"%{q}%"),
            HL7Message.visit_number.ilike(f"%{q}%")
        )
        
        query = (
            select(HL7Message)
            .where(search_filters)
            .order_by(desc(HL7Message.processed_at))
            .limit(limit)
        )
        
        result = await db.execute(query)
        messages = result.scalars().all()
        
        # Format results
        search_results = []
        for message in messages:
            patient_name = None
            if message.patient_first_name or message.patient_last_name:
                first = message.patient_first_name or ""
                last = message.patient_last_name or ""
                patient_name = f"{first} {last}".strip()
            
            search_results.append({
                "id": str(message.id),
                "filename": message.original_filename,
                "message_type": message.message_type,
                "patient_id": message.patient_id,
                "patient_name": patient_name,
                "visit_number": message.visit_number,
                "processed_at": message.processed_at.isoformat() if message.processed_at else None,
                "status": message.processing_status
            })
        
        return {
            "query": q,
            "results": search_results,
            "count": len(search_results)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching messages: {str(e)}"
        )