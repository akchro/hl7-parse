"""
Pydantic models for conversion saving functionality
"""

from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime
import uuid

class SaveConversionRequest(BaseModel):
    """Request model for saving conversion data"""
    hl7_content: str = Field(..., description="Original HL7 message content")
    json_content: Optional[Dict[str, Any]] = Field(None, description="Converted JSON data")
    xml_content: Optional[str] = Field(None, description="Converted XML data")
    conversion_metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata from conversion process")
    title: Optional[str] = Field(None, max_length=200, description="Optional title for the saved conversion")
    description: Optional[str] = Field(None, description="Optional description")
    user_id: Optional[str] = Field(None, max_length=100, description="Optional user identifier")

    class Config:
        json_schema_extra = {
            "example": {
                "hl7_content": "MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20230101120000||ADT^A01^ADT_A01|123456789|P|2.5",
                "json_content": {"message_type": "ADT", "patient": {"name": "John Doe"}},
                "xml_content": "<HL7><MSH>...</MSH></HL7>",
                "title": "Patient Admission - John Doe",
                "description": "ADT message for patient admission"
            }
        }

class SaveConversionResponse(BaseModel):
    """Response model for save conversion operation"""
    success: bool = Field(..., description="Whether the save operation was successful")
    message: str = Field(..., description="Success or error message")
    conversion_id: Optional[str] = Field(None, description="UUID of the saved conversion")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Conversion saved successfully",
                "conversion_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }

class SavedConversionResponse(BaseModel):
    """Response model for retrieving saved conversions"""
    id: str = Field(..., description="UUID of the saved conversion")
    title: Optional[str] = Field(None, description="Title of the saved conversion")
    description: Optional[str] = Field(None, description="Description of the saved conversion")
    original_hl7_content: str = Field(..., description="Original HL7 message content")
    json_content: Optional[Dict[str, Any]] = Field(None, description="Converted JSON data")
    xml_content: Optional[str] = Field(None, description="Converted XML data")
    conversion_metadata: Optional[Dict[str, Any]] = Field(None, description="Conversion metadata")
    user_id: Optional[str] = Field(None, description="User identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Patient Admission - John Doe",
                "description": "ADT message for patient admission",
                "original_hl7_content": "MSH|^~\\&|SENDING_APP...",
                "json_content": {"message_type": "ADT", "patient": {"name": "John Doe"}},
                "xml_content": "<HL7><MSH>...</MSH></HL7>",
                "created_at": "2023-01-01T12:00:00",
                "updated_at": "2023-01-01T12:00:00"
            }
        }

class SavedConversionListResponse(BaseModel):
    """Response model for listing saved conversions"""
    conversions: list[SavedConversionResponse] = Field(..., description="List of saved conversions")
    total: int = Field(..., description="Total number of saved conversions")
    page: int = Field(1, description="Current page number")
    per_page: int = Field(10, description="Number of items per page")
    
    class Config:
        json_schema_extra = {
            "example": {
                "conversions": [],
                "total": 0,
                "page": 1,
                "per_page": 10
            }
        }