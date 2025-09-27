"""
Mastra AI Service Integration
Handles communication with Mastra agents for HL7 processing
"""

import httpx
import asyncio
from typing import Dict, Any, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class MastraService:
    """Service for interacting with Mastra AI agents"""
    
    def __init__(self):
        self.mastra_endpoint = settings.MASTRA_ENDPOINT
        self.timeout = settings.PROCESS_TIMEOUT
        
    async def process_hl7_message(self, hl7_content: str) -> Dict[str, Any]:
        """
        Process HL7 message using Mastra agents
        Returns: Dict with 'xml', 'json', and 'pdf' keys
        """
        try:
            # Run both agents in parallel
            xml_json_task = self._convert_to_structured_formats(hl7_content)
            pdf_task = self._convert_to_pdf_format(hl7_content)
            
            # Wait for both tasks to complete
            xml_json_result, pdf_result = await asyncio.gather(
                xml_json_task,
                pdf_task,
                return_exceptions=True
            )
            
            results = {}
            
            # Handle XML/JSON results
            if isinstance(xml_json_result, Exception):
                logger.error(f"XML/JSON conversion failed: {xml_json_result}")
                results.update({"xml": None, "json": None})
            else:
                results.update(xml_json_result)
            
            # Handle PDF results
            if isinstance(pdf_result, Exception):
                logger.error(f"PDF conversion failed: {pdf_result}")
                results["pdf"] = None
            else:
                results["pdf"] = pdf_result
            
            return results
            
        except Exception as e:
            logger.error(f"Error in Mastra processing: {e}")
            return {"xml": None, "json": None, "pdf": None}
    
    async def _convert_to_structured_formats(self, hl7_content: str) -> Dict[str, Any]:
        """
        Convert HL7 to XML and JSON using Mastra structured data agent
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.mastra_endpoint}/agents/hl7-to-structured",
                    json={
                        "hl7_content": hl7_content,
                        "output_formats": ["xml", "json"]
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "xml": result.get("xml"),
                        "json": result.get("json")
                    }
                else:
                    logger.error(f"Mastra XML/JSON conversion failed: {response.status_code} - {response.text}")
                    return {"xml": None, "json": None}
                    
        except httpx.TimeoutException:
            logger.error("Timeout calling Mastra XML/JSON conversion service")
            return {"xml": None, "json": None}
        except Exception as e:
            logger.error(f"Error calling Mastra XML/JSON service: {e}")
            return {"xml": None, "json": None}
    
    async def _convert_to_pdf_format(self, hl7_content: str) -> Optional[bytes]:
        """
        Convert HL7 to PDF using Mastra PDF generation agent
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.mastra_endpoint}/agents/hl7-to-pdf",
                    json={
                        "hl7_content": hl7_content,
                        "format": "latex"
                    }
                )
                
                if response.status_code == 200:
                    # Assuming the PDF is returned as bytes
                    return response.content
                else:
                    logger.error(f"Mastra PDF conversion failed: {response.status_code} - {response.text}")
                    return None
                    
        except httpx.TimeoutException:
            logger.error("Timeout calling Mastra PDF conversion service")
            return None
        except Exception as e:
            logger.error(f"Error calling Mastra PDF service: {e}")
            return None
    
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
    
    async def get_agent_status(self, agent_name: str) -> Dict[str, Any]:
        """
        Get status of a specific Mastra agent
        """
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(f"{self.mastra_endpoint}/agents/{agent_name}/status")
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {"status": "unknown", "error": f"HTTP {response.status_code}"}
                    
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Mock implementation for testing when Mastra is not available
class MockMastraService(MastraService):
    """Mock Mastra service for development/testing"""
    
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
    
    async def health_check(self) -> bool:
        """Mock health check always returns True"""
        return True