"""
Mastra-specific endpoints for HL7 conversion using Gemini AI
"""

from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from typing import Optional
import logging

from app.services.mastra_service import MastraService, MockMastraService
from app.utils.file_handler import file_handler
from app.models.hl7_models import ConversionRequest, ConversionResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mastra", tags=["Mastra AI Conversion"])

# Initialize Mastra service
try:
    mastra_service = MastraService()
except Exception as e:
    logger.warning(f"Failed to initialize Mastra service, using mock: {e}")
    mastra_service = MockMastraService()

@router.get("/health")
async def check_mastra_health():
    """Check if Mastra service is available"""
    is_healthy = await mastra_service.health_check()
    return {
        "service": "mastra",
        "status": "healthy" if is_healthy else "unhealthy",
        "available": is_healthy
    }

@router.post("/convert/json", response_model=ConversionResponse)
async def convert_hl7_to_json(request: ConversionRequest):
    """
    Convert HL7 message to JSON using Mastra Gemini agent
    """
    try:
        result = await mastra_service.convert_hl7_to_json(request.hl7_content)
        
        return ConversionResponse(
            success=result.get("success", False),
            message="HL7 converted to JSON successfully" if result.get("success") else "JSON conversion failed",
            data={
                "format": "json",
                "content": result.get("data"),
                "metadata": result.get("metadata")
            }
        )
    except Exception as e:
        logger.error(f"Error converting HL7 to JSON: {e}")
        raise HTTPException(status_code=500, detail=f"JSON conversion failed: {str(e)}")

@router.post("/convert/xml", response_model=ConversionResponse)
async def convert_hl7_to_xml(request: ConversionRequest):
    """
    Convert HL7 message to XML using Mastra Gemini agent
    """
    try:
        result = await mastra_service.convert_hl7_to_xml(request.hl7_content)
        
        return ConversionResponse(
            success=result.get("success", False),
            message="HL7 converted to XML successfully" if result.get("success") else "XML conversion failed",
            data={
                "format": "xml",
                "content": result.get("data"),
                "metadata": result.get("metadata")
            }
        )
    except Exception as e:
        logger.error(f"Error converting HL7 to XML: {e}")
        raise HTTPException(status_code=500, detail=f"XML conversion failed: {str(e)}")

@router.post("/convert/both", response_model=ConversionResponse)
async def convert_hl7_to_both_formats(request: ConversionRequest):
    """
    Convert HL7 message to both JSON and XML using Mastra Gemini agent workflow
    """
    try:
        result = await mastra_service.convert_hl7_both_formats(request.hl7_content)
        
        if result.get("success") and result.get("data"):
            data = result["data"]
            json_result = data.get("jsonResult", {})
            xml_result = data.get("xmlResult", {})
            
            return ConversionResponse(
                success=True,
                message="HL7 converted to both JSON and XML successfully",
                data={
                    "json": {
                        "success": json_result.get("success", False),
                        "content": json_result.get("data"),
                        "metadata": json_result.get("metadata"),
                        "error": json_result.get("error")
                    },
                    "xml": {
                        "success": xml_result.get("success", False),
                        "content": xml_result.get("data"),
                        "metadata": xml_result.get("metadata"),
                        "error": xml_result.get("error")
                    }
                }
            )
        else:
            return ConversionResponse(
                success=False,
                message="Conversion failed",
                data={"error": "Both JSON and XML conversion failed"}
            )
            
    except Exception as e:
        logger.error(f"Error converting HL7 to both formats: {e}")
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

@router.post("/convert/file/json")
async def convert_uploaded_file_to_json(file: UploadFile = File(...)):
    """
    Upload HL7 file and convert to JSON using Mastra Gemini agent
    """
    try:
        # Save uploaded file
        content = await file.read()
        file_path = await file_handler.save_uploaded_file(file.filename, content)
        
        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            hl7_content = f.read()
        
        # Convert using Mastra
        result = await mastra_service.convert_hl7_to_json(hl7_content)
        
        return JSONResponse(content={
            "success": result.get("success", False),
            "message": "File converted to JSON successfully" if result.get("success") else "JSON conversion failed",
            "filename": file.filename,
            "data": {
                "format": "json",
                "content": result.get("data"),
                "metadata": result.get("metadata")
            }
        })
        
    except Exception as e:
        logger.error(f"Error converting uploaded file to JSON: {e}")
        raise HTTPException(status_code=500, detail=f"File conversion failed: {str(e)}")

@router.post("/convert/file/xml")
async def convert_uploaded_file_to_xml(file: UploadFile = File(...)):
    """
    Upload HL7 file and convert to XML using Mastra Gemini agent
    """
    try:
        # Save uploaded file
        content = await file.read()
        file_path = await file_handler.save_uploaded_file(file.filename, content)
        
        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            hl7_content = f.read()
        
        # Convert using Mastra
        result = await mastra_service.convert_hl7_to_xml(hl7_content)
        
        return JSONResponse(content={
            "success": result.get("success", False),
            "message": "File converted to XML successfully" if result.get("success") else "XML conversion failed",
            "filename": file.filename,
            "data": {
                "format": "xml",
                "content": result.get("data"),
                "metadata": result.get("metadata")
            }
        })
        
    except Exception as e:
        logger.error(f"Error converting uploaded file to XML: {e}")
        raise HTTPException(status_code=500, detail=f"File conversion failed: {str(e)}")

@router.post("/convert/file/both")
async def convert_uploaded_file_to_both_formats(file: UploadFile = File(...)):
    """
    Upload HL7 file and convert to both JSON and XML using Mastra Gemini agent workflow
    """
    try:
        # Save uploaded file
        content = await file.read()
        file_path = await file_handler.save_uploaded_file(file.filename, content)
        
        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            hl7_content = f.read()
        
        # Convert using Mastra
        result = await mastra_service.convert_hl7_both_formats(hl7_content)
        
        if result.get("success") and result.get("data"):
            data = result["data"]
            json_result = data.get("jsonResult", {})
            xml_result = data.get("xmlResult", {})
            
            return JSONResponse(content={
                "success": True,
                "message": "File converted to both JSON and XML successfully",
                "filename": file.filename,
                "data": {
                    "json": {
                        "success": json_result.get("success", False),
                        "content": json_result.get("data"),
                        "metadata": json_result.get("metadata"),
                        "error": json_result.get("error")
                    },
                    "xml": {
                        "success": xml_result.get("success", False),
                        "content": xml_result.get("data"),
                        "metadata": xml_result.get("metadata"),
                        "error": xml_result.get("error")
                    }
                }
            })
        else:
            return JSONResponse(content={
                "success": False,
                "message": "File conversion failed",
                "filename": file.filename,
                "data": {"error": "Both JSON and XML conversion failed"}
            })
            
    except Exception as e:
        logger.error(f"Error converting uploaded file to both formats: {e}")
        raise HTTPException(status_code=500, detail=f"File conversion failed: {str(e)}")

@router.get("/agent/status/{agent_name}")
async def get_agent_status(agent_name: str):
    """
    Get status of a specific Mastra agent
    """
    try:
        status = await mastra_service.get_agent_status(agent_name)
        return {
            "agent": agent_name,
            "status": status
        }
    except Exception as e:
        logger.error(f"Error getting agent status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get agent status: {str(e)}")