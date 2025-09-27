"""
Conversions router for saving and managing converted HL7 data
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from typing import Optional
import logging
import uuid

from app.database.database import get_db
from app.database.models import SavedConversion
from app.models.conversion_models import (
    SaveConversionRequest, 
    SaveConversionResponse, 
    SavedConversionResponse,
    SavedConversionListResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/conversions", tags=["Saved Conversions"])

@router.post("/save", response_model=SaveConversionResponse)
async def save_conversion(
    request: SaveConversionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Save a converted HL7 message with JSON and XML data to the database
    """
    try:
        # Validate that we have at least the HL7 content
        if not request.hl7_content or not request.hl7_content.strip():
            raise HTTPException(status_code=400, detail="HL7 content is required")
        
        # Validate that we have at least one converted format
        if not request.json_content and not request.xml_content:
            raise HTTPException(status_code=400, detail="At least one converted format (JSON or XML) is required")
        
        # Create new SavedConversion record
        saved_conversion = SavedConversion(
            original_hl7_content=request.hl7_content,
            json_content=request.json_content,
            xml_content=request.xml_content,
            conversion_metadata=request.conversion_metadata,
            title=request.title,
            description=request.description,
            user_id=request.user_id
        )
        
        # Add to database
        db.add(saved_conversion)
        await db.commit()
        await db.refresh(saved_conversion)
        
        logger.info(f"Saved conversion with ID: {saved_conversion.id}")
        
        return SaveConversionResponse(
            success=True,
            message="Conversion saved successfully",
            conversion_id=str(saved_conversion.id)
        )
        
    except IntegrityError as e:
        await db.rollback()
        # Check if this is a duplicate HL7 content error
        if "ix_saved_conversions_original_hl7_content_hash" in str(e):
            logger.warning(f"Attempted to save duplicate HL7 content")
            raise HTTPException(
                status_code=409,
                detail="This HL7 message has already been saved. Each HL7 message can only be saved once."
            )
        else:
            logger.error(f"Database integrity error: {e}")
            raise HTTPException(status_code=500, detail=f"Database integrity error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving conversion: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save conversion: {str(e)}")

@router.get("/list", response_model=SavedConversionListResponse)
async def list_saved_conversions(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    per_page: int = Query(10, ge=1, le=100, description="Number of items per page"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    List saved conversions with pagination
    """
    try:
        # Build query
        query = select(SavedConversion)
        
        # Add user filter if provided
        if user_id:
            query = query.where(SavedConversion.user_id == user_id)
        
        # Add ordering (newest first)
        query = query.order_by(SavedConversion.created_at.desc())
        
        # Get total count
        count_query = select(func.count(SavedConversion.id))
        if user_id:
            count_query = count_query.where(SavedConversion.user_id == user_id)
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Add pagination
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        
        # Execute query
        result = await db.execute(query)
        conversions = result.scalars().all()
        
        # Convert to response models
        conversion_responses = [
            SavedConversionResponse(
                id=str(conv.id),
                title=conv.title,
                description=conv.description,
                original_hl7_content=conv.original_hl7_content,
                json_content=conv.json_content,
                xml_content=conv.xml_content,
                conversion_metadata=conv.conversion_metadata,
                user_id=conv.user_id,
                created_at=conv.created_at,
                updated_at=conv.updated_at
            )
            for conv in conversions
        ]
        
        return SavedConversionListResponse(
            conversions=conversion_responses,
            total=total,
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        logger.error(f"Error listing saved conversions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list conversions: {str(e)}")

@router.get("/{conversion_id}", response_model=SavedConversionResponse)
async def get_saved_conversion(
    conversion_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific saved conversion by ID
    """
    try:
        # Validate UUID format
        try:
            uuid.UUID(conversion_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid conversion ID format")
        
        # Query for the conversion
        query = select(SavedConversion).where(SavedConversion.id == conversion_id)
        result = await db.execute(query)
        conversion = result.scalar_one_or_none()
        
        if not conversion:
            raise HTTPException(status_code=404, detail="Conversion not found")
        
        return SavedConversionResponse(
            id=str(conversion.id),
            title=conversion.title,
            description=conversion.description,
            original_hl7_content=conversion.original_hl7_content,
            json_content=conversion.json_content,
            xml_content=conversion.xml_content,
            conversion_metadata=conversion.conversion_metadata,
            user_id=conversion.user_id,
            created_at=conversion.created_at,
            updated_at=conversion.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting saved conversion: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get conversion: {str(e)}")

@router.delete("/{conversion_id}")
async def delete_saved_conversion(
    conversion_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a saved conversion by ID
    """
    try:
        # Validate UUID format
        try:
            uuid.UUID(conversion_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid conversion ID format")
        
        # Query for the conversion
        query = select(SavedConversion).where(SavedConversion.id == conversion_id)
        result = await db.execute(query)
        conversion = result.scalar_one_or_none()
        
        if not conversion:
            raise HTTPException(status_code=404, detail="Conversion not found")
        
        # Delete the conversion
        await db.delete(conversion)
        await db.commit()
        
        logger.info(f"Deleted conversion with ID: {conversion_id}")
        
        return {
            "success": True,
            "message": "Conversion deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting saved conversion: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete conversion: {str(e)}")