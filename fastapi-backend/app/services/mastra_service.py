"""
Mastra AI Service Integration
Handles communication with Mastra agents for HL7 processing
"""

import httpx
import asyncio
import os
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class MastraService:
    """Service for interacting with Mastra AI agents"""
    
    def __init__(self):
        self.mastra_endpoint = os.getenv("MASTRA_SERVICE_URL", "http://localhost:3001")
        self.timeout = 60.0
        
    async def convert_hl7_to_json(self, hl7_content: str) -> Dict[str, Any]:
        """
        Convert HL7 message to JSON using Mastra service
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.mastra_endpoint}/convert-hl7/json",
                    json={"hl7Content": hl7_content}
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling Mastra JSON conversion: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling Mastra JSON conversion: {e}")
            raise
    
    async def convert_hl7_to_xml(self, hl7_content: str) -> Dict[str, Any]:
        """
        Convert HL7 message to XML using Mastra service
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.mastra_endpoint}/convert-hl7/xml",
                    json={"hl7Content": hl7_content}
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling Mastra XML conversion: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling Mastra XML conversion: {e}")
            raise
    
    async def convert_hl7_both_formats(self, hl7_content: str) -> Dict[str, Any]:
        """
        Convert HL7 message to both JSON and XML using Mastra service
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.mastra_endpoint}/convert-hl7",
                    json={"hl7Content": hl7_content}
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling Mastra conversion: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling Mastra conversion: {e}")
            raise
    
    async def convert_hl7_to_plain_english(self, hl7_content: str) -> Dict[str, Any]:
        """
        Convert HL7 message to plain English medical report
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.mastra_endpoint}/convert-hl7/plain-english",
                    json={"hl7Content": hl7_content}
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling Mastra plain English conversion: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling Mastra plain English conversion: {e}")
            raise
    
    async def convert_hl7_to_latex(self, hl7_content: str) -> Dict[str, Any]:
        """
        Convert HL7 message to LaTeX document
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.mastra_endpoint}/convert-hl7/latex",
                    json={"hl7Content": hl7_content}
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling Mastra LaTeX conversion: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling Mastra LaTeX conversion: {e}")
            raise
    
    async def convert_hl7_to_medical_document(
        self, 
        hl7_content: str, 
        generate_pdf: bool = False,
        format: str = "both"
    ) -> Dict[str, Any]:
        """
        Convert HL7 message to complete medical document with optional PDF
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.mastra_endpoint}/convert-hl7/medical-document",
                    json={
                        "hl7Content": hl7_content,
                        "generatePdf": generate_pdf,
                        "format": format
                    }
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling Mastra medical document conversion: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling Mastra medical document conversion: {e}")
            raise
    
    async def process_hl7_message(self, hl7_content: str) -> Dict[str, Any]:
        """
        Process HL7 message using Mastra agents - legacy method for compatibility
        Returns: Dict with 'xml', 'json', and 'pdf' keys
        """
        try:
            # Use the new dual conversion method
            result = await self.convert_hl7_both_formats(hl7_content)
            
            # Extract the data from the nested response structure
            if result.get("success") and result.get("data"):
                data = result["data"]
                json_result = data.get("jsonResult", {})
                xml_result = data.get("xmlResult", {})
                
                return {
                    "json": json_result.get("data") if json_result.get("success") else None,
                    "xml": xml_result.get("data") if xml_result.get("success") else None,
                    "pdf": None  # PDF generation not implemented in new Mastra service
                }
            else:
                return {"json": None, "xml": None, "pdf": None}
                
        except Exception as e:
            logger.error(f"Error in Mastra processing: {e}")
            return {"json": None, "xml": None, "pdf": None}
    
    async def health_check(self) -> bool:
        """
        Check if Mastra service is available
        """
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(f"{self.mastra_endpoint}/health")
                return response.status_code == 200
        except Exception:
            return False
    
    async def analyze_triage(self, hl7_messages: list[str]) -> Dict[str, Any]:
        """
        Analyze multiple HL7 messages for medical triage severity assessment
        """
        try:
            async with httpx.AsyncClient(timeout=120) as client:  # Longer timeout for AI processing
                response = await client.post(
                    f"{self.mastra_endpoint}/triage-analysis",
                    json={
                        "hl7_messages": hl7_messages,
                        "patient_count": len(hl7_messages)
                    }
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling Mastra triage analysis: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling Mastra triage analysis: {e}")
            raise
    
    async def get_agent_status(self, agent_name: str) -> Dict[str, Any]:
        """
        Get status of a specific Mastra agent
        """
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(f"{self.mastra_endpoint}/health")
                
                if response.status_code == 200:
                    return {"status": "active", "service": "mastra-hl7-service"}
                else:
                    return {"status": "unknown", "error": f"HTTP {response.status_code}"}
                    
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Mock implementation for testing when Mastra is not available
class MockMastraService(MastraService):
    """Mock Mastra service for development/testing"""
    
    async def convert_hl7_to_json(self, hl7_content: str) -> Dict[str, Any]:
        """Mock JSON conversion"""
        await asyncio.sleep(1)
        return {
            "success": True,
            "data": self._generate_mock_json(hl7_content)
        }
    
    async def convert_hl7_to_xml(self, hl7_content: str) -> Dict[str, Any]:
        """Mock XML conversion"""
        await asyncio.sleep(1)
        return {
            "success": True,
            "data": self._generate_mock_xml(hl7_content)
        }
    
    async def convert_hl7_both_formats(self, hl7_content: str) -> Dict[str, Any]:
        """Mock both formats conversion"""
        await asyncio.sleep(2)
        return {
            "success": True,
            "data": {
                "jsonResult": {
                    "success": True,
                    "data": self._generate_mock_json(hl7_content)
                },
                "xmlResult": {
                    "success": True,
                    "data": self._generate_mock_xml(hl7_content)
                }
            }
        }
    
    async def process_hl7_message(self, hl7_content: str) -> Dict[str, Any]:
        """
        Mock implementation that generates sample outputs
        """
        # Simulate processing delay
        await asyncio.sleep(2)
        
        # Generate mock XML
        mock_xml = self._generate_mock_xml(hl7_content)
        
        # Generate mock JSON
        mock_json = self._generate_mock_json(hl7_content)
        
        # Generate mock PDF (placeholder bytes)
        mock_pdf = self._generate_mock_pdf()
        
        return {
            "xml": mock_xml,
            "json": mock_json,
            "pdf": mock_pdf
        }
    
    def _generate_mock_xml(self, hl7_content: str) -> str:
        """Generate mock XML output"""
        lines = hl7_content.strip().split('\n')
        first_line = lines[0] if lines else ""
        
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<HL7Message>
    <MessageHeader>
        <RawMSH>{first_line}</RawMSH>
        <MessageType>ADT</MessageType>
        <ProcessedBy>Mock Mastra Agent</ProcessedBy>
    </MessageHeader>
    <PatientInfo>
        <PatientID>123456789</PatientID>
        <Name>
            <FirstName>John</FirstName>
            <LastName>Doe</LastName>
        </Name>
        <DateOfBirth>1985-03-15</DateOfBirth>
        <Gender>M</Gender>
    </PatientInfo>
    <VisitInfo>
        <VisitNumber>V20241201001</VisitNumber>
        <AdmissionDate>2024-12-01T12:00:00</AdmissionDate>
        <Location>ICU-101</Location>
    </VisitInfo>
</HL7Message>"""
    
    def _generate_mock_json(self, hl7_content: str) -> Dict[str, Any]:
        """Generate mock JSON output"""
        return {
            "messageHeader": {
                "messageType": "ADT",
                "triggerEvent": "A01",
                "timestamp": "2024-12-01T12:00:00Z",
                "processedBy": "Mock Mastra Agent"
            },
            "patient": {
                "patientId": "123456789",
                "name": {
                    "firstName": "John",
                    "lastName": "Doe"
                },
                "dateOfBirth": "1985-03-15",
                "gender": "M",
                "address": {
                    "street": "123 Main St",
                    "city": "Anytown",
                    "state": "NY",
                    "zipCode": "12345"
                }
            },
            "visit": {
                "visitNumber": "V20241201001",
                "admissionDate": "2024-12-01T12:00:00Z",
                "location": "ICU-101",
                "attendingPhysician": "Dr. Smith"
            },
            "allergies": [
                {
                    "allergen": "Penicillin",
                    "severity": "Severe",
                    "reaction": "Anaphylaxis"
                }
            ],
            "rawHL7": hl7_content[:100] + "..." if len(hl7_content) > 100 else hl7_content
        }
    
    def _generate_mock_pdf(self) -> bytes:
        """Generate mock PDF bytes"""
        # This is a minimal PDF structure for testing
        pdf_content = """%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Mock HL7 PDF Report) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000181 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
275
%%EOF"""
        return pdf_content.encode('utf-8')
    
    async def convert_hl7_to_plain_english(self, hl7_content: str) -> Dict[str, Any]:
        """Mock plain English conversion"""
        await asyncio.sleep(1)
        return {
            "success": True,
            "data": {
                "plainEnglish": self._generate_mock_plain_english(hl7_content),
                "timestamp": "2024-12-01T12:00:00Z"
            }
        }
    
    async def convert_hl7_to_latex(self, hl7_content: str) -> Dict[str, Any]:
        """Mock LaTeX conversion"""
        await asyncio.sleep(1)
        return {
            "success": True,
            "data": {
                "plainEnglish": self._generate_mock_plain_english(hl7_content),
                "latex": self._generate_mock_latex(),
                "timestamp": "2024-12-01T12:00:00Z"
            }
        }
    
    async def convert_hl7_to_medical_document(
        self, 
        hl7_content: str, 
        generate_pdf: bool = False,
        format: str = "both"
    ) -> Dict[str, Any]:
        """Mock medical document conversion"""
        await asyncio.sleep(2)
        result = {
            "success": True,
            "data": {
                "plainEnglish": self._generate_mock_plain_english(hl7_content),
                "timestamp": "2024-12-01T12:00:00Z"
            }
        }
        
        if format in ["html", "both"]:
            result["data"]["html"] = self._generate_mock_html()
        
        if format in ["latex", "both"]:
            result["data"]["latex"] = self._generate_mock_latex()
        
        if generate_pdf:
            result["data"]["pdfBase64"] = "bW9jayBwZGYgY29udGVudA=="
            result["data"]["pdfFilename"] = "medical-doc-mock.pdf"
        
        return result
    
    def _generate_mock_plain_english(self, hl7_content: str) -> str:
        """Generate mock plain English output"""
        return """MEDICAL REPORT

Patient Information:
- Name: John Doe
- ID: 123456789
- Date of Birth: March 15, 1985
- Gender: Male

Visit Information:
- Visit Number: V20241201001
- Admission Date: December 1, 2024 at 12:00 PM
- Location: Intensive Care Unit, Room 101
- Attending Physician: Dr. Jane Smith

Clinical Notes:
The patient was admitted to the ICU for observation following a surgical procedure.

Allergies:
- Penicillin (Severe - Risk of anaphylaxis)

Current Medications:
- None listed

Lab Results:
- No recent lab results available

This is a mock medical report generated for demonstration purposes."""
    
    def _generate_mock_html(self) -> str:
        """Generate mock HTML output"""
        return """<!DOCTYPE html>
<html>
<head>
    <title>Medical Report</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        h1 { color: #333; }
        .section { margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Medical Report</h1>
    <div class="section">
        <h2>Patient Information</h2>
        <p>Name: John Doe</p>
        <p>ID: 123456789</p>
    </div>
</body>
</html>"""
    
    def _generate_mock_latex(self) -> str:
        """Generate mock LaTeX output"""
        return r"""\documentclass{article}
\begin{document}
\title{Medical Report}
\maketitle
\section{Patient Information}
Name: John Doe\\
ID: 123456789\\
\end{document}"""
    
    async def analyze_triage(self, hl7_messages: list[str]) -> Dict[str, Any]:
        """Mock triage analysis"""
        await asyncio.sleep(3)  # Simulate AI processing time
        
        mock_results = []
        severity_scores = [85, 72, 58, 91, 45]  # Mix of different severity levels
        priority_levels = ["Emergent", "Urgent", "Non-urgent", "Immediate", "Delayed"]
        timelines = ["Within 15 minutes", "Within 1 hour", "Within 2-4 hours", "Immediate", "Routine"]
        
        for i, hl7_content in enumerate(hl7_messages):
            # Extract mock patient info from HL7
            lines = hl7_content.split('\n')
            patient_name = f"Patient {i+1}"
            patient_id = f"P{12345 + i}"
            
            # Try to extract real patient name if available
            for line in lines:
                if line.startswith('PID'):
                    segments = line.split('|')
                    if len(segments) >= 6:
                        name_segment = segments[5]
                        if name_segment:
                            name_parts = name_segment.split('^')
                            if len(name_parts) >= 2:
                                patient_name = f"{name_parts[1]} {name_parts[0]}".strip()
                        id_segment = segments[3]
                        if id_segment:
                            id_parts = id_segment.split('^')
                            if id_parts:
                                patient_id = id_parts[0]
                    break
            
            score_index = i % len(severity_scores)
            mock_results.append({
                "patient_id": patient_id,
                "patient_name": patient_name,
                "severity_score": severity_scores[score_index],
                "priority_level": priority_levels[score_index],
                "clinical_summary": f"Mock clinical assessment for {patient_name}",
                "key_findings": [
                    "Vital signs reviewed",
                    "Medical history assessed",
                    "Clinical presentation evaluated"
                ],
                "recommended_timeline": timelines[score_index],
                "reasoning": f"Based on clinical indicators and triage protocols, assigned severity score of {severity_scores[score_index]}"
            })
        
        # Sort by severity score (highest first)
        mock_results.sort(key=lambda x: x["severity_score"], reverse=True)
        
        return {
            "success": True,
            "data": mock_results,
            "metadata": {
                "patientsAnalyzed": len(mock_results),
                "timestamp": "2024-12-01T12:00:00Z",
                "triageProtocols": ["ESI", "CTAS", "MTS"]
            }
        }
    
    async def health_check(self) -> bool:
        """Mock health check always returns True"""
        return True