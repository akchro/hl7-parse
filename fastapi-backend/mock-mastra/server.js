const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'mock-mastra', timestamp: new Date().toISOString() });
});

// Mock HL7 to Structured Data Agent (XML + JSON)
app.post('/agents/hl7-to-structured', async (req, res) => {
    try {
        const { hl7_content, output_formats } = req.body;
        
        if (!hl7_content) {
            return res.status(400).json({ error: 'hl7_content is required' });
        }

        console.log(`[${new Date().toISOString()}] Processing HL7 to structured formats:`, output_formats);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Extract patient info from HL7 for more realistic output
        const lines = hl7_content.split('\n');
        const mshLine = lines.find(line => line.startsWith('MSH')) || '';
        const pidLine = lines.find(line => line.startsWith('PID')) || '';
        
        // Parse some basic info
        let messageType = 'ADT';
        let patientName = 'Unknown Patient';
        let patientId = '123456789';
        
        if (mshLine) {
            const mshFields = mshLine.split('|');
            if (mshFields.length > 8) {
                messageType = mshFields[8].split('^')[0] || 'ADT';
            }
        }
        
        if (pidLine) {
            const pidFields = pidLine.split('|');
            if (pidFields.length > 3) {
                patientId = pidFields[3].split('^')[0] || '123456789';
            }
            if (pidFields.length > 5) {
                const nameField = pidFields[5];
                const nameComponents = nameField.split('^');
                if (nameComponents.length >= 2) {
                    patientName = `${nameComponents[1]} ${nameComponents[0]}`.trim();
                }
            }
        }

        // Generate mock XML
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<HL7Message>
    <MessageHeader>
        <MessageType>${messageType}</MessageType>
        <ProcessedAt>${new Date().toISOString()}</ProcessedAt>
        <ProcessedBy>Mock Mastra Agent v1.0</ProcessedBy>
    </MessageHeader>
    <Patient>
        <PatientID>${patientId}</PatientID>
        <Name>${patientName}</Name>
        <DateOfBirth>1985-03-15</DateOfBirth>
        <Gender>M</Gender>
        <Address>
            <Street>123 Main St</Street>
            <City>Anytown</City>
            <State>NY</State>
            <ZipCode>12345</ZipCode>
        </Address>
    </Patient>
    <Visit>
        <VisitNumber>V${Date.now()}</VisitNumber>
        <AdmissionDate>${new Date().toISOString()}</AdmissionDate>
        <Location>ICU-101</Location>
        <AttendingPhysician>Dr. Smith</AttendingPhysician>
    </Visit>
    <Observations>
        <Observation>
            <Name>Blood Pressure</Name>
            <Value>120/80</Value>
            <Units>mmHg</Units>
        </Observation>
        <Observation>
            <Name>Heart Rate</Name>
            <Value>72</Value>
            <Units>bpm</Units>
        </Observation>
    </Observations>
</HL7Message>`;

        // Generate mock JSON
        const jsonContent = {
            messageHeader: {
                messageType: messageType,
                triggerEvent: messageType === 'ADT' ? 'A01' : 'R01',
                timestamp: new Date().toISOString(),
                processedBy: 'Mock Mastra Agent v1.0',
                sendingApplication: 'EPIC',
                receivingApplication: 'HL7_LITEBOARD'
            },
            patient: {
                patientId: patientId,
                name: patientName,
                firstName: patientName.split(' ')[0] || 'John',
                lastName: patientName.split(' ')[1] || 'Doe',
                dateOfBirth: '1985-03-15',
                gender: 'M',
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    state: 'NY',
                    zipCode: '12345',
                    country: 'USA'
                },
                phone: '(555) 123-4567',
                maritalStatus: 'Single'
            },
            visit: {
                visitNumber: `V${Date.now()}`,
                patientClass: 'Inpatient',
                admissionDate: new Date().toISOString(),
                location: 'ICU-101',
                attendingPhysician: 'Dr. Smith',
                room: '101',
                bed: '01'
            },
            observations: [
                {
                    id: 'OBS001',
                    name: 'Blood Pressure',
                    value: '120/80',
                    units: 'mmHg',
                    normalRange: '90/60 - 140/90',
                    status: 'Normal'
                },
                {
                    id: 'OBS002',
                    name: 'Heart Rate',
                    value: '72',
                    units: 'bpm',
                    normalRange: '60-100',
                    status: 'Normal'
                }
            ],
            allergies: [
                {
                    allergen: 'Penicillin',
                    severity: 'Severe',
                    reaction: 'Anaphylaxis',
                    status: 'Active'
                }
            ],
            processing: {
                processedAt: new Date().toISOString(),
                processingTime: '2.1 seconds',
                agent: 'hl7-to-structured',
                version: '1.0.0'
            }
        };

        console.log(`[${new Date().toISOString()}] Successfully generated structured formats for patient: ${patientName}`);

        res.json({
            xml: xmlContent,
            json: jsonContent,
            metadata: {
                processing_time: 2.1,
                patient_name: patientName,
                message_type: messageType,
                segments_processed: lines.length
            }
        });

    } catch (error) {
        console.error('Error in HL7 to structured conversion:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Mock HL7 to PDF Agent
app.post('/agents/hl7-to-pdf', async (req, res) => {
    try {
        const { hl7_content, format } = req.body;
        
        if (!hl7_content) {
            return res.status(400).json({ error: 'hl7_content is required' });
        }

        console.log(`[${new Date().toISOString()}] Processing HL7 to PDF format:`, format);
        
        // Simulate longer processing delay for PDF
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Generate a simple PDF-like binary content (mock)
        const pdfHeader = '%PDF-1.4\n';
        const pdfContent = `
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
/Length 200
>>
stream
BT
/F1 14 Tf
72 720 Td
(HL7 LiteBoard - Patient Report) Tj
0 -20 Td
(Generated: ${new Date().toLocaleString()}) Tj
0 -40 Td
(Patient Information:) Tj
0 -20 Td
(- Patient ID: 123456789) Tj
0 -20 Td
(- Name: John Doe) Tj
0 -20 Td
(- DOB: 1985-03-15) Tj
0 -20 Td
(- Gender: Male) Tj
0 -40 Td
(Visit Information:) Tj
0 -20 Td
(- Location: ICU-101) Tj
0 -20 Td
(- Admission: ${new Date().toLocaleDateString()}) Tj
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
450
%%EOF`;

        const fullPdfContent = pdfHeader + pdfContent;
        
        console.log(`[${new Date().toISOString()}] Successfully generated PDF (${fullPdfContent.length} bytes)`);

        // Return PDF as binary data
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(fullPdfContent, 'utf8'));

    } catch (error) {
        console.error('Error in HL7 to PDF conversion:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Agent status endpoints
app.get('/agents/:agentName/status', (req, res) => {
    const { agentName } = req.params;
    
    res.json({
        agent: agentName,
        status: 'healthy',
        version: '1.0.0',
        uptime: process.uptime(),
        lastProcessed: new Date().toISOString(),
        capabilities: agentName === 'hl7-to-structured' 
            ? ['xml_generation', 'json_generation', 'data_parsing']
            : ['pdf_generation', 'latex_formatting', 'medical_reports']
    });
});

// Generic agent processing endpoint
app.post('/process', async (req, res) => {
    try {
        const { hl7_content, output_formats } = req.body;
        
        console.log(`[${new Date().toISOString()}] Generic processing request for formats:`, output_formats);
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        res.json({
            success: true,
            message: 'HL7 content processed successfully',
            formats_generated: output_formats || ['xml', 'json', 'pdf'],
            processing_time: 1.5,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in generic processing:', error);
        res.status(500).json({ error: 'Processing failed', details: error.message });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mock Mastra Service running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔄 HL7 to Structured: POST http://localhost:${PORT}/agents/hl7-to-structured`);
    console.log(`📄 HL7 to PDF: POST http://localhost:${PORT}/agents/hl7-to-pdf`);
    console.log(`⚡ Ready to process HL7 messages!`);
});