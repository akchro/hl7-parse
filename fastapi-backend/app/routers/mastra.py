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
from pydantic import BaseModel
from typing import Dict, Any, List
import re
import hashlib

logger = logging.getLogger(__name__)

class MedicalDocumentRequest(BaseModel):
    hl7_content: str
    generatePdf: Optional[bool] = False
    format: Optional[str] = "both"

class TriageAnalysisRequest(BaseModel):
    hl7_messages: List[str]
    patient_count: Optional[int] = None

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

@router.post("/convert/plain-english")
async def convert_hl7_to_plain_english(request: ConversionRequest):
    """
    Convert HL7 message to plain English medical report
    """
    try:
        result = await mastra_service.convert_hl7_to_plain_english(request.hl7_content)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error converting HL7 to plain English: {e}")
        raise HTTPException(status_code=500, detail=f"Plain English conversion failed: {str(e)}")

@router.post("/convert/latex")
async def convert_hl7_to_latex(request: ConversionRequest):
    """
    Convert HL7 message to LaTeX document
    """
    try:
        result = await mastra_service.convert_hl7_to_latex(request.hl7_content)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error converting HL7 to LaTeX: {e}")
        raise HTTPException(status_code=500, detail=f"LaTeX conversion failed: {str(e)}")

@router.post("/convert/medical-document")
async def convert_hl7_to_medical_document(request: MedicalDocumentRequest):
    """
    Convert HL7 message to complete medical document with optional PDF generation
    """
    try:
        result = await mastra_service.convert_hl7_to_medical_document(
            request.hl7_content,
            request.generatePdf,
            request.format
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error converting HL7 to medical document: {e}")
        raise HTTPException(status_code=500, detail=f"Medical document generation failed: {str(e)}")

@router.post("/triage-analysis")
async def analyze_triage(request: TriageAnalysisRequest):
    """
    Analyze multiple HL7 messages for medical triage severity assessment using Gemini AI
    """
    try:
        if not request.hl7_messages:
            raise HTTPException(status_code=400, detail="At least one HL7 message is required")
        
        if len(request.hl7_messages) > 50:  # Reasonable limit to prevent overload
            raise HTTPException(status_code=400, detail="Maximum 50 patients can be analyzed at once")
        
        logger.info(f"Processing triage analysis for {len(request.hl7_messages)} patients")
        
        # Call the Mastra service for triage analysis
        try:
            result = await mastra_service.analyze_triage(request.hl7_messages)
        except Exception as e:
            logger.warning(f"Primary Mastra service failed for triage analysis: {e}")
            logger.info("Falling back to enhanced parsing without AI for triage analysis")
            # Fall back to enhanced parsing instead of mock service
            result = await _fallback_triage_analysis(request.hl7_messages)
        
        return {
            "success": result.get("success", True),
            "message": f"Triage analysis completed for {len(request.hl7_messages)} patients",
            "data": result.get("data", []),
            "metadata": result.get("metadata", {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in triage analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Triage analysis failed: {str(e)}")

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


async def _fallback_triage_analysis(hl7_messages: List[str]) -> Dict[str, Any]:
    """
    Fallback triage analysis that extracts real patient information from HL7 messages
    without relying on AI services. Uses rule-based parsing and scoring.
    """
    results = []
    
    for i, hl7_content in enumerate(hl7_messages):
        try:
            # Parse HL7 segments
            lines = [line.strip() for line in hl7_content.split('\n') if line.strip()]
            
            # Initialize patient data
            patient_info = _parse_patient_info(lines)
            clinical_info = _parse_clinical_info(lines)
            
            # Calculate basic severity score based on available data
            severity_score = _calculate_severity_score(clinical_info, patient_info)
            priority_level = _get_priority_level(severity_score)
            timeline = _get_recommended_timeline(severity_score)
            
            # Create triage result with real patient data
            triage_result = {
                "patient_id": patient_info.get("id", f"UNKNOWN_{i+1}"),
                "patient_name": patient_info.get("name", f"Patient {i+1}"),
                "severity_score": severity_score,
                "priority_level": priority_level,
                "clinical_summary": _generate_clinical_summary(clinical_info, patient_info),
                "key_findings": _extract_key_findings(clinical_info),
                "recommended_timeline": timeline,
                "reasoning": f"Score based on parsed HL7 data: {_get_scoring_reasoning(clinical_info, patient_info)}"
            }
            
            results.append(triage_result)
            
        except Exception as e:
            logger.warning(f"Error parsing HL7 message {i+1}: {e}")
            # Create a basic result for unparseable messages
            results.append({
                "patient_id": f"PARSE_ERROR_{i+1}",
                "patient_name": f"Patient {i+1} (Parse Error)",
                "severity_score": 50,  # Default middle score
                "priority_level": "Non-urgent",
                "clinical_summary": "Unable to parse HL7 message for detailed analysis",
                "key_findings": ["HL7 parsing error"],
                "recommended_timeline": "Routine",
                "reasoning": "Default score due to HL7 parsing error"
            })
    
    # Sort by severity score (highest first)
    results.sort(key=lambda x: x["severity_score"], reverse=True)
    
    return {
        "success": True,
        "data": results,
        "metadata": {
            "patientsAnalyzed": len(results),
            "timestamp": "2024-12-01T12:00:00Z",
            "triageProtocols": ["Rule-based parsing", "HL7 direct analysis"],
            "fallback_mode": True
        }
    }


def _parse_patient_info(lines: List[str]) -> Dict[str, str]:
    """Extract patient information from HL7 PID segment"""
    patient_info = {"id": "", "name": "", "dob": "", "gender": ""}
    
    for line in lines:
        if line.startswith('PID'):
            segments = line.split('|')
            if len(segments) >= 6:
                # Extract patient ID from PID.3
                if len(segments) > 3 and segments[3]:
                    id_parts = segments[3].split('^')
                    patient_info["id"] = id_parts[0] if id_parts else segments[3]
                
                # Extract patient name from PID.5  
                if len(segments) > 5 and segments[5]:
                    name_parts = segments[5].split('^')
                    if len(name_parts) >= 2:
                        # Format: LAST^FIRST^MIDDLE
                        first_name = name_parts[1] if len(name_parts) > 1 else ""
                        last_name = name_parts[0] if len(name_parts) > 0 else ""
                        patient_info["name"] = f"{first_name} {last_name}".strip()
                    else:
                        patient_info["name"] = segments[5]
                
                # Extract DOB from PID.7
                if len(segments) > 7 and segments[7]:
                    patient_info["dob"] = segments[7]
                
                # Extract gender from PID.8  
                if len(segments) > 8 and segments[8]:
                    patient_info["gender"] = segments[8]
            break
    
    return patient_info


def _parse_clinical_info(lines: List[str]) -> Dict[str, Any]:
    """Extract clinical information from various HL7 segments"""
    clinical_info = {
        "message_type": "",
        "chief_complaint": "",
        "observations": [],
        "vital_signs": {},
        "admit_type": "",
        "location": ""
    }
    
    for line in lines:
        # Parse MSH segment for message type
        if line.startswith('MSH'):
            segments = line.split('|')
            if len(segments) >= 9:
                msg_type_field = segments[8]
                if '^' in msg_type_field:
                    clinical_info["message_type"] = msg_type_field.split('^')[0]
                else:
                    clinical_info["message_type"] = msg_type_field
        
        # Parse PV1 segment for visit information
        elif line.startswith('PV1'):
            segments = line.split('|')
            if len(segments) > 2:
                clinical_info["admit_type"] = segments[2] if len(segments) > 2 else ""
                clinical_info["location"] = segments[3] if len(segments) > 3 else ""
        
        # Parse OBX segments for observations
        elif line.startswith('OBX'):
            segments = line.split('|')
            if len(segments) >= 6:
                obs_type = segments[3] if len(segments) > 3 else ""
                obs_value = segments[5] if len(segments) > 5 else ""
                
                if "CHIEF_COMPLAINT" in obs_type.upper():
                    clinical_info["chief_complaint"] = obs_value
                elif any(vital in obs_type.upper() for vital in ["TEMP", "BP", "PULSE", "RESP", "O2"]):
                    clinical_info["vital_signs"][obs_type] = obs_value
                else:
                    clinical_info["observations"].append(f"{obs_type}: {obs_value}")
    
    return clinical_info


def _calculate_severity_score(clinical_info: Dict[str, Any], patient_info: Dict[str, str]) -> int:
    """Calculate severity score based on parsed HL7 data"""
    base_score = 50  # Default baseline
    
    # Adjust based on message type
    msg_type = clinical_info.get("message_type", "").upper()
    if msg_type in ["ADT"]:
        base_score += 10  # Admission typically indicates moderate concern
    
    # Adjust based on admit type  
    admit_type = clinical_info.get("admit_type", "").upper()
    if "E" in admit_type or "EMERGENCY" in admit_type:
        base_score += 20
    elif "U" in admit_type or "URGENT" in admit_type:
        base_score += 15
    elif "I" in admit_type or "INPATIENT" in admit_type:
        base_score += 10
    
    # Adjust based on chief complaint keywords
    complaint = clinical_info.get("chief_complaint", "").lower()
    high_risk_keywords = ["chest pain", "difficulty breathing", "unconscious", "severe", "critical"]
    moderate_risk_keywords = ["pain", "discomfort", "nausea", "fever"]
    
    for keyword in high_risk_keywords:
        if keyword in complaint:
            base_score += 25
            break
    else:
        for keyword in moderate_risk_keywords:
            if keyword in complaint:
                base_score += 10
                break
    
    # Adjust based on location  
    location = clinical_info.get("location", "").upper()
    if "ICU" in location or "CCU" in location:
        base_score += 30
    elif "ED" in location or "EMERGENCY" in location:
        base_score += 20
    
    # Keep score within valid range
    return max(1, min(100, base_score))


def _get_priority_level(severity_score: int) -> str:
    """Get priority level based on severity score"""
    if severity_score >= 90:
        return "Immediate"
    elif severity_score >= 80:
        return "Emergent"
    elif severity_score >= 70:
        return "Urgent"
    elif severity_score >= 60:
        return "Less Urgent"
    elif severity_score >= 50:
        return "Non-urgent"
    else:
        return "Delayed"


def _get_recommended_timeline(severity_score: int) -> str:
    """Get recommended timeline based on severity score"""
    if severity_score >= 90:
        return "Immediate"
    elif severity_score >= 80:
        return "Within 15 minutes"
    elif severity_score >= 70:
        return "Within 1 hour"
    elif severity_score >= 60:
        return "Within 2-4 hours"
    else:
        return "Routine"


def _generate_clinical_summary(clinical_info: Dict[str, Any], patient_info: Dict[str, str]) -> str:
    """Generate a clinical summary from parsed data"""
    summary_parts = []
    
    if clinical_info.get("message_type"):
        summary_parts.append(f"Message type: {clinical_info['message_type']}")
    
    if clinical_info.get("chief_complaint"):
        summary_parts.append(f"Chief complaint: {clinical_info['chief_complaint']}")
    
    if clinical_info.get("admit_type"):
        summary_parts.append(f"Admission type: {clinical_info['admit_type']}")
    
    if clinical_info.get("location"):
        summary_parts.append(f"Location: {clinical_info['location']}")
    
    if not summary_parts:
        summary_parts.append("Clinical assessment based on available HL7 data")
    
    return ". ".join(summary_parts)


def _extract_key_findings(clinical_info: Dict[str, Any]) -> List[str]:
    """Extract key findings from clinical data"""
    findings = []
    
    if clinical_info.get("chief_complaint"):
        findings.append(f"Chief complaint: {clinical_info['chief_complaint']}")
    
    if clinical_info.get("vital_signs"):
        findings.append("Vital signs recorded")
    
    if clinical_info.get("observations"):
        findings.extend(clinical_info["observations"][:3])  # Limit to first 3
    
    if clinical_info.get("location"):
        findings.append(f"Location: {clinical_info['location']}")
    
    if not findings:
        findings.append("HL7 message processed")
    
    return findings


def _get_scoring_reasoning(clinical_info: Dict[str, Any], patient_info: Dict[str, str]) -> str:
    """Provide reasoning for the calculated score"""
    factors = []
    
    msg_type = clinical_info.get("message_type", "")
    if msg_type:
        factors.append(f"message type ({msg_type})")
    
    admit_type = clinical_info.get("admit_type", "")
    if admit_type:
        factors.append(f"admission type ({admit_type})")
    
    if clinical_info.get("chief_complaint"):
        factors.append("chief complaint analysis")
    
    location = clinical_info.get("location", "")
    if location:
        factors.append(f"location ({location})")
    
    if factors:
        return ", ".join(factors)
    else:
        return "baseline HL7 data analysis"