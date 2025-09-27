"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, 
  Download,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  Eye,
  Shield,
  Calendar,
  User,
  Building,
  Stethoscope
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

// API endpoints configuration for PDF generation
const PDF_API_ENDPOINTS = {
  generate: '/api/generate-pdf', // POST endpoint for PDF generation
  preview: '/api/preview-pdf', // POST endpoint for PDF preview
}

interface PDFGeneratorPageProps {
  hl7Content?: string
  messageType?: string
}

interface PDFSection {
  title: string
  icon: React.ReactNode
  content: string
  segments: string[]
}

interface PatientInfo {
  name: string
  mrn: string
  dob: string
  gender: string
  address: string
  phone: string
}

interface PDFData {
  messageType: string
  timestamp: string
  patientInfo: PatientInfo
  sections: PDFSection[]
  metadata: {
    segmentCount: number
    characterCount: number
    processingTime: number
  }
}

// PDF service functions
const pdfService = {
  // Generate PDF from HL7 content
  async generatePDF(pdfData: PDFData): Promise<{ pdfUrl: string; filename: string }> {
    const response = await fetch(PDF_API_ENDPOINTS.generate, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfData),
    })

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.statusText}`)
    }

    return response.json()
  },

  // Get PDF preview
  async previewPDF(pdfData: PDFData): Promise<{ previewUrl: string }> {
    const response = await fetch(PDF_API_ENDPOINTS.preview, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfData),
    })

    if (!response.ok) {
      throw new Error(`Preview generation failed: ${response.statusText}`)
    }

    return response.json()
  }
}

// HL7 Parser for PDF formatting
const parseHL7ForPDF = (hl7Content: string, messageType: string): PDFData => {
  const segments = hl7Content.split('\n').filter(segment => segment.trim());
  const now = new Date();
  
  // Extract patient information from PID segment
  let patientInfo: PatientInfo = {
    name: 'Not available',
    mrn: 'Not available',
    dob: 'Not available',
    gender: 'Not available',
    address: 'Not available',
    phone: 'Not available'
  };

  const pidSegment = segments.find(seg => seg.startsWith('PID'));
  if (pidSegment) {
    const fields = pidSegment.split('|');
    // PID.5 - Patient Name
    if (fields[5]) {
      const nameParts = fields[5].split('^');
      patientInfo.name = [nameParts[0], nameParts[1]].filter(Boolean).join(' ');
    }
    // PID.3 - Patient ID (MRN)
    if (fields[3]) {
      const mrnParts = fields[3].split('^');
      patientInfo.mrn = mrnParts[0] || 'Not available';
    }
    // PID.7 - Date of Birth
    if (fields[7]) {
      patientInfo.dob = formatHL7Date(fields[7]);
    }
    // PID.8 - Sex
    if (fields[8]) {
      patientInfo.gender = fields[8];
    }
    // PID.11 - Patient Address
    if (fields[11]) {
      const addressParts = fields[11].split('^');
      patientInfo.address = addressParts.slice(0, 3).filter(Boolean).join(', ');
    }
    // PID.13 - Phone Number
    if (fields[13]) {
      patientInfo.phone = fields[13];
    }
  }

  // Organize segments by type for PDF sections
  const sections: PDFSection[] = [];
  
  const segmentGroups: { [key: string]: string[] } = {};
  segments.forEach(segment => {
    const segmentType = segment.substring(0, 3);
    if (!segmentGroups[segmentType]) {
      segmentGroups[segmentType] = [];
    }
    segmentGroups[segmentType].push(segment);
  });

  // Create sections based on segment types
  Object.entries(segmentGroups).forEach(([type, segs]) => {
    const section = createSection(type, segs);
    if (section) {
      sections.push(section);
    }
  });

  return {
    messageType,
    timestamp: now.toISOString(),
    patientInfo,
    sections,
    metadata: {
      segmentCount: segments.length,
      characterCount: hl7Content.length,
      processingTime: Date.now() - now.getTime()
    }
  };
};

const createSection = (segmentType: string, segments: string[]): PDFSection | null => {
  const sectionConfig: { [key: string]: { title: string; icon: React.ReactNode } } = {
    MSH: { title: 'Message Header', icon: <Shield className="h-4 w-4" /> },
    PID: { title: 'Patient Information', icon: <User className="h-4 w-4" /> },
    PV1: { title: 'Patient Visit', icon: <Building className="h-4 w-4" /> },
    OBR: { title: 'Observation Request', icon: <Stethoscope className="h-4 w-4" /> },
    OBX: { title: 'Observation Results', icon: <FileText className="h-4 w-4" /> },
    EVN: { title: 'Event Type', icon: <Calendar className="h-4 w-4" /> },
  };

  const config = sectionConfig[segmentType];
  if (!config) return null;

  return {
    title: config.title,
    icon: config.icon,
    content: segments.join('\n'),
    segments: segments
  };
};

const formatHL7Date = (dateStr: string): string => {
  if (dateStr.length === 8) {
    // YYYYMMDD format
    return `${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}/${dateStr.substring(0, 4)}`;
  }
  return dateStr;
};

// Default HL7 content for demonstration
const defaultHL7Content = `MSH|^~\\&|HIS|HOSPITAL|LAB|HOSPITAL|20230101120000||ADT^A01|MSG00001|P|2.5|
PID|1|123456789|123456789^^^HOSPITAL^MR||DOE^JOHN^A^^MR||19800101|M|||123 MAIN ST^^ANYTOWN^ST^12345^USA||(555)555-1234|||S|||123456789|
PV1|1|I|ICU^201^1^HOSPITAL^01||||123456^DOCTOR^ALAN^A^^DR^^^HOSPITAL|||||||||123456^DOCTOR^ALAN^A^^DR^^^HOSPITAL|
OBR|1|123456789|LAB12345^LAB|CBC^COMPLETE BLOOD COUNT|||20230101120000||||||||123456^DOCTOR^ALAN^A^^DR^^^HOSPITAL|||||||||||F|
OBX|1|NM|WBC^WHITE BLOOD CELLS||7.5|10^3/uL|4.0-11.0|N|||F|
OBX|2|NM|RBC^RED BLOOD CELLS||4.5|10^6/uL|4.5-6.0|N|||F|`

const defaultMessageType = "ADT^A01"

export default function PDFGeneratorPage({ 
  hl7Content = defaultHL7Content, 
  messageType = defaultMessageType 
}: PDFGeneratorPageProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const [customHL7Content, setCustomHL7Content] = useState(hl7Content)
  const [customMessageType, setCustomMessageType] = useState(messageType)

  const pdfData = parseHL7ForPDF(customHL7Content, customMessageType)

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    setError("")

    try {
      const result = await pdfService.generatePDF(pdfData)
      setPdfUrl(result.pdfUrl)
      
      // Auto-download the PDF
      const a = document.createElement('a')
      a.href = result.pdfUrl
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error('PDF generation failed:', error)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreviewPDF = async () => {
    setError("")
    
    try {
      const result = await pdfService.previewPDF(pdfData)
      setPreviewUrl(result.previewUrl)
      setActiveTab("preview")
    } catch (error) {
      console.error('Preview generation failed:', error)
      setError('Failed to generate preview. Please try again.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyHL7 = () => {
    navigator.clipboard.writeText(customHL7Content)
  }

  const handleHL7ContentChange = (content: string) => {
    setCustomHL7Content(content)
    // Try to extract message type from MSH segment
    const mshSegment = content.split('\n').find(line => line.startsWith('MSH'))
    if (mshSegment) {
      const fields = mshSegment.split('|')
      if (fields[8]) {
        setCustomMessageType(fields[8])
      }
    }
  }

  const getMessageTypeDisplay = () => {
    const typeMap: { [key: string]: string } = {
      'ADT^A01': 'ADT-A01 - Admit/Visit Notification',
      'ADT^A03': 'ADT-A03 - Discharge/End Visit',
      'ADT^A04': 'ADT-A04 - Register Patient',
      'ORU^R01': 'ORU-R01 - Observation Result',
      'ORM^O01': 'ORM-O01 - Order Message',
    }
    return typeMap[customMessageType] || customMessageType
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HL7 to PDF Generator</h1>
            <p className="text-muted-foreground">Create readable PDF documents from HL7 messages</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleGeneratePDF} disabled={isGenerating} className="gap-2">
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {/* HL7 Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>HL7 Message Input</CardTitle>
            <CardDescription>
              Paste your HL7 message below or use the default example
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="messageType">Message Type</Label>
                  <Textarea
                    id="messageType"
                    value={customMessageType}
                    onChange={(e) => setCustomMessageType(e.target.value)}
                    className="font-mono text-sm h-10"
                    placeholder="e.g., ADT^A01"
                  />
                </div>
                <div>
                  <Label htmlFor="messageTypeDisplay">Message Type Display</Label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-muted/50">
                    <span className="text-sm">{getMessageTypeDisplay()}</span>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="hl7Content">HL7 Message Content</Label>
                <Textarea
                  id="hl7Content"
                  value={customHL7Content}
                  onChange={(e) => handleHL7ContentChange(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                  placeholder="Paste your HL7 message here..."
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCopyHL7} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy HL7
                </Button>
                <Button onClick={handlePreviewPDF} className="gap-2">
                  <Eye className="h-4 w-4" />
                  Generate Preview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Patient Name</Label>
                    <p className="text-lg font-semibold">{pdfData.patientInfo.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">MRN</Label>
                      <p className="text-sm">{pdfData.patientInfo.mrn}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">DOB</Label>
                      <p className="text-sm">{pdfData.patientInfo.dob}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Gender</Label>
                      <p className="text-sm">{pdfData.patientInfo.gender}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Address</Label>
                    <p className="text-sm">{pdfData.patientInfo.address}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p className="text-sm">{pdfData.patientInfo.phone}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Message Type:</span>
                    <Badge variant="secondary">{getMessageTypeDisplay()}</Badge>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Segments:</span>
                    <span>{pdfData.metadata.segmentCount}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Generated:</span>
                    <span>{new Date(pdfData.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PDF Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">
                  <Eye className="h-4 w-4 mr-2" />
                  PDF Preview
                </TabsTrigger>
                <TabsTrigger value="sections">
                  <FileText className="h-4 w-4 mr-2" />
                  Message Sections
                </TabsTrigger>
                <TabsTrigger value="raw">
                  <FileText className="h-4 w-4 mr-2" />
                  Raw HL7
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>PDF Preview</CardTitle>
                    <CardDescription>
                      Preview of the generated PDF document
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {previewUrl ? (
                      <iframe 
                        src={previewUrl} 
                        className="w-full h-96 border rounded-lg"
                        title="PDF Preview"
                      />
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Click "Generate Preview" to see the PDF</p>
                        <Button onClick={handlePreviewPDF} className="mt-4">
                          Generate Preview
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sections" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>HL7 Message Sections</CardTitle>
                    <CardDescription>
                      Organized view of HL7 segments by type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {pdfData.sections.map((section, index) => (
                      <motion.div
                        key={section.title}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          {section.icon}
                          <h3 className="font-semibold text-lg">{section.title}</h3>
                          <Badge variant="outline" className="ml-auto">
                            {section.segments.length} segment(s)
                          </Badge>
                        </div>
                        <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                          <pre>{section.content}</pre>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="raw" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Raw HL7 Message</span>
                      <Button variant="outline" size="sm" onClick={handleCopyHL7}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy HL7
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Current HL7 message content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      value={customHL7Content}
                      readOnly
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-destructive">
              <Shield className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* PDF Generation Status */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <Card className="w-96">
              <CardContent className="pt-6 text-center">
                <div className="animate-pulse mb-4">
                  <FileText className="h-12 w-12 text-primary mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Generating PDF</h3>
                <p className="text-muted-foreground mb-4">
                  Creating formatted document...
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}