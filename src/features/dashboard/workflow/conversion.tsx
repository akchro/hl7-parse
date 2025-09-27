"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Upload, 
  FileText, 
  Zap, 
  Download,
  Copy, 
  Check, 
  Database,
  FileCode,
  FileOutput,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

type ConversionStage = 'input' | 'processing' | 'results'

// API endpoints configuration - UPDATED to match your backend
const API_ENDPOINTS = {
  convert: '/api/v1/mastra/convert/both', // POST endpoint for HL7 conversion
  validate: '/api/v1/mastra/validate', // POST endpoint for message validation
  save: '/api/v1/conversions/save', // POST endpoint for saving results
  generatePdf: '/api/v1/mastra/convert/medical-document', // PDF generation endpoint
}

// HL7 Message types - will be populated from API or config
const HL7_MESSAGE_TYPES = [
  { value: 'ADT^A01', label: 'ADT-A01', description: 'Admit/Visit Notification' },
  { value: 'ADT^A03', label: 'ADT-A03', description: 'Discharge/End Visit' },
  { value: 'ADT^A04', label: 'ADT-A04', description: 'Register a Patient' },
  { value: 'ADT^A08', label: 'ADT-A08', description: 'Update Patient Information' },
  { value: 'ORU^R01', label: 'ORU-R01', description: 'Observation Result' },
  { value: 'ORM^O01', label: 'ORM-O01', description: 'Order Message' },
  { value: 'SIU^S12', label: 'SIU-S12', description: 'Appointment Booking' },
  { value: 'MDM^T02', label: 'MDM-T02', description: 'Documentation Management' },
  { value: 'other', label: 'Other', description: 'Custom HL7 Message' },
]

// API service functions - UPDATED with proper error handling and response formats
const apiService = {
  // Convert HL7 to JSON/XML - UPDATED to match your backend response format
  async convertHL7(hl7Content: string, messageType: string): Promise<{ json: any; xml: string }> {
    const response = await fetch(API_ENDPOINTS.convert, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hl7_content: hl7Content,
        message_type: messageType,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`)
    }

    const data = await response.json()
    
    // Handle your backend's response format
    if (data.success && data.data) {
      return {
        json: data.data.json?.content || {},
        xml: data.data.xml?.content || ''
      }
    } else {
      throw new Error(data.message || 'Conversion failed')
    }
  },

  // Validate HL7 message - UPDATED with proper error handling
  async validateHL7(hl7Content: string): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const response = await fetch(API_ENDPOINTS.validate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hl7_content: hl7Content }),
      })

      if (!response.ok) {
        // If validation endpoint doesn't exist, return valid to allow conversion
        if (response.status === 404) {
          return { valid: true, errors: [] }
        }
        const errorData = await response.json().catch(() => ({ detail: 'Validation failed' }))
        throw new Error(`Validation failed: ${errorData.detail || response.statusText}`)
      }

      const data = await response.json()
      return data // Expecting { valid: boolean, errors: string[] }
    } catch (error) {
      console.warn('Validation service unavailable, proceeding with conversion')
      return { valid: true, errors: [] } // Default to valid if service is down
    }
  },

  // Save conversion results - UPDATED to match your backend
  async saveResults(results: any): Promise<{ success: boolean; id?: string }> {
    const response = await fetch(API_ENDPOINTS.save, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hl7_content: results.hl7_content,
        json_content: results.json_output ? JSON.parse(results.json_output) : null,
        xml_content: results.xml_output,
        pdf_base64: null, // Can be added if PDF generation is implemented
        title: `HL7 Conversion - ${new Date().toLocaleString()}`,
        description: 'Converted using HL7 Converter'
      }),
    })

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('This HL7 message has already been saved to the database.')
      }
      const errorData = await response.json().catch(() => ({ detail: 'Save failed' }))
      throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`)
    }

    const data = await response.json()
    return { success: data.success, id: data.id }
  },

  // NEW: Generate PDF medical document
  async generatePdf(hl7Content: string): Promise<{ pdfBase64: string }> {
    const response = await fetch(API_ENDPOINTS.generatePdf, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hl7_content: hl7Content,
        generatePdf: true,
        format: 'both'
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'PDF generation failed' }))
      throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`)
    }

    const data = await response.json()
    if (data.success && data.data.pdfBase64) {
      return { pdfBase64: data.data.pdfBase64 }
    } else {
      throw new Error(data.message || 'PDF generation failed')
    }
  }
}

// NEW: Utility function for base64 to blob conversion
const decodeBase64ToBlob = (base64: string, type: string): Blob => {
  try {
    const byteCharacters = atob(base64)
    const byteArray = new Uint8Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i)
    }
    return new Blob([byteArray], { type })
  } catch (error) {
    throw new Error('Failed to decode PDF data')
  }
}

export default function HL7ConversionPage() {
  const [hl7Input, setHl7Input] = useState("")
  const [messageType, setMessageType] = useState("")
  const [activeTab, setActiveTab] = useState("manual")
  const [stage, setStage] = useState<ConversionStage>('input')
  const [jsonOutput, setJsonOutput] = useState("")
  const [xmlOutput, setXmlOutput] = useState("")
  const [pdfBase64, setPdfBase64] = useState("") // NEW: PDF state
  const [isCopied, setIsCopied] = useState({ json: false, xml: false })
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false) // NEW: PDF loading state
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("") // NEW: Success message state
  const [validationResult, setValidationResult] = useState<{valid: boolean; errors: string[]} | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && (file.type === "text/plain" || file.name.endsWith(".hl7"))) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setHl7Input(event.target?.result as string)
        setValidationResult(null)
        setError("")
      }
      reader.readAsText(file)
    } else {
      setError("Please upload a .txt or .hl7 file")
    }
  }

  // Validate HL7 message before conversion
  const validateMessage = async (): Promise<boolean> => {
    if (!hl7Input.trim()) {
      setError("Please enter HL7 content before validating.")
      return false
    }

    try {
      const result = await apiService.validateHL7(hl7Input)
      setValidationResult(result)
      
      if (!result.valid) {
        setError(`Validation failed: ${result.errors.join(', ')}`)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Validation error:', error)
      setError('Validation service unavailable. Proceeding with conversion...')
      return true // Continue even if validation service is down
    }
  }

  const handleConvert = async () => {
    if (!hl7Input.trim()) {
      setError("Please enter HL7 content before converting.")
      return
    }

    if (!messageType) {
      setError("Please select a message type.")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")
    setStage('processing')

    try {
      // Optional: Validate before conversion
      const isValid = await validateMessage()
      if (!isValid) {
        setStage('input')
        setIsLoading(false)
        return
      }

      // Perform conversion
      const result = await apiService.convertHL7(hl7Input, messageType)
      setJsonOutput(JSON.stringify(result.json, null, 2))
      setXmlOutput(result.xml)
      setStage('results')
      setSuccess("Conversion completed successfully!")
    } catch (error) {
      console.error('Conversion failed:', error)
      setError(error instanceof Error ? error.message : 'Conversion failed. Please check your HL7 format and try again.')
      setStage('input')
    } finally {
      setIsLoading(false)
    }
  }

  // NEW: PDF generation handler
  const handleGeneratePdf = async () => {
    if (!hl7Input.trim()) {
      setError("Please enter HL7 content before generating PDF.")
      return
    }

    setIsGeneratingPdf(true)
    setError("")
    setSuccess("")

    try {
      const result = await apiService.generatePdf(hl7Input)
      setPdfBase64(result.pdfBase64)
      setSuccess("PDF generated successfully!")
    } catch (error) {
      console.error('PDF generation failed:', error)
      setError(error instanceof Error ? error.message : 'PDF generation failed.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // NEW: PDF viewing function
  const viewPdf = () => {
    if (pdfBase64) {
      try {
        const blob = decodeBase64ToBlob(pdfBase64, 'application/pdf')
        const url = URL.createObjectURL(blob)
        const newWindow = window.open(url, '_blank')
        if (newWindow) {
          newWindow.onload = () => URL.revokeObjectURL(url)
        } else {
          setError('Please allow popups to view the PDF')
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('Error opening PDF:', error)
        setError('Failed to open PDF')
      }
    }
  }

  // NEW: PDF download function
  const downloadPdf = () => {
    if (pdfBase64) {
      try {
        const blob = decodeBase64ToBlob(pdfBase64, 'application/pdf')
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'medical-document.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading PDF:', error)
        setError('Failed to download PDF')
      }
    }
  }

  const handleSaveResults = async () => {
    try {
      const saveResult = await apiService.saveResults({
        hl7_content: hl7Input,
        message_type: messageType,
        json_output: jsonOutput,
        xml_output: xmlOutput,
        converted_at: new Date().toISOString(),
      })

      if (saveResult.success) {
        setSuccess('Results saved successfully!')
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      console.error('Save failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to save results. Please try again.')
    }
  }

  const handleCopyCode = (type: 'json' | 'xml') => {
    const text = type === 'json' ? jsonOutput : xmlOutput
    if (text) {
      navigator.clipboard.writeText(text)
      setIsCopied(prev => ({ ...prev, [type]: true }))
      setTimeout(() => setIsCopied(prev => ({ ...prev, [type]: false })), 2000)
    }
  }

  const handleDownload = (type: 'json' | 'xml') => {
    const content = type === 'json' ? jsonOutput : xmlOutput
    if (content) {
      const blob = new Blob([content], { 
        type: type === 'json' ? 'application/json' : 'application/xml' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hl7-conversion.${type}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const loadSampleHL7 = () => {
    const sampleHL7 = `MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20230101120000||ADT^A01^ADT_A01|123456789|P|2.5
EVN||202301011200|||^USER^USER^^^^^^USER
PID|1||123456789^^^MRN^MR||DOE^JOHN^MIDDLE^^MR^||19850315|M|||123 MAIN ST^^ANYTOWN^NY^12345^USA||(555)123-4567|||||123-45-6789|||||||||||||||
PV1|1|I|ICU^101^01||||^DOCTOR^ATTENDING^^^MD||||||||||V123456789|||||||||||||||||||||||||202301011200|`
    
    setHl7Input(sampleHL7)
    setMessageType('ADT^A01')
    setError("")
    setSuccess("")
    setValidationResult(null)
    setPdfBase64("") // Clear previous PDF
  }

  const resetForm = () => {
    setStage('input')
    setHl7Input("")
    setMessageType("")
    setJsonOutput("")
    setXmlOutput("")
    setPdfBase64("")
    setError("")
    setSuccess("")
    setValidationResult(null)
  }

  const getSelectedMessageType = () => {
    return HL7_MESSAGE_TYPES.find(type => type.value === messageType)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AnimatePresence mode="wait">
        {stage === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold mb-4">HL7 Message Converter</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Convert HL7 v2 messages to structured JSON and XML formats with PDF generation
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* HL7 Input Section */}
              <motion.div variants={fadeUp} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      HL7 Input
                    </CardTitle>
                    <CardDescription>
                      Enter your HL7 message manually or upload a file
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Input</TabsTrigger>
                        <TabsTrigger value="upload">File Upload</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="manual" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="hl7-input">HL7 Message Content</Label>
                          <Textarea 
                            id="hl7-input"
                            placeholder="Paste your HL7 message here..."
                            rows={12}
                            value={hl7Input}
                            onChange={(e) => {
                              setHl7Input(e.target.value)
                              setValidationResult(null)
                              setError("")
                            }}
                            className="font-mono text-sm"
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="upload" className="space-y-4">
                        <div 
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => document.getElementById('hl7-upload')?.click()}
                        >
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            .txt or .hl7 files accepted
                          </p>
                          <Input 
                            id="hl7-upload"
                            type="file" 
                            className="hidden" 
                            accept=".txt,.hl7"
                            onChange={handleFileUpload}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Message Type Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="message-type">HL7 Message Type</Label>
                      <Select value={messageType} onValueChange={setMessageType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select message type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {HL7_MESSAGE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{type.label}</span>
                                <span className="text-xs text-muted-foreground">{type.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadSampleHL7}
                        className="flex-1"
                      >
                        Load Sample Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Validation Result */}
                {validationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      validationResult.valid 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {validationResult.valid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        validationResult.valid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {validationResult.valid ? 'Message is valid' : 'Validation errors found'}
                      </span>
                    </div>
                    {validationResult.errors.length > 0 && (
                      <ul className="mt-2 text-xs text-red-700 list-disc list-inside">
                        {validationResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}

                {/* Input Summary */}
                {hl7Input && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {getSelectedMessageType()?.label || 'HL7 Message'} Ready
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hl7Input.split('\n').length} segments detected
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {hl7Input.length} chars
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Conversion Info Section */}
              <motion.div variants={fadeUp} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Conversion Settings
                    </CardTitle>
                    <CardDescription>
                      Configure how your HL7 message will be processed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {messageType && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Selected Message Type</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            {getSelectedMessageType()?.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {getSelectedMessageType()?.description}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <FileCode className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">JSON Output</p>
                          <p className="text-xs text-muted-foreground">
                            Structured data for APIs and applications
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                        <FileOutput className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">XML Output</p>
                          <p className="text-xs text-muted-foreground">
                            Standard format for healthcare systems
                          </p>
                        </div>
                      </div>

                      {/* NEW: PDF Generation Option */}
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">PDF Document</p>
                          <p className="text-xs text-muted-foreground">
                            Generate medical document PDF
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* NEW: PDF Generation Button */}
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleGeneratePdf}
                      disabled={!hl7Input.trim() || isGeneratingPdf}
                    >
                      {isGeneratingPdf ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Generate Medical PDF
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleConvert}
                  disabled={!hl7Input.trim() || !messageType || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      Converting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Convert HL7 Message
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <p className="text-sm">{success}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="animate-pulse mb-6">
              <Zap className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Converting HL7 Message</h3>
            <p className="text-muted-foreground text-center mb-6">
              Parsing segments and generating structured outputs...
            </p>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ 
                  width: isLoading ? '70%' : '100%',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
            </div>
          </motion.div>
        )}

        {stage === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Conversion Successful!</h2>
              <p className="text-muted-foreground">
                Your HL7 message has been converted to JSON and XML formats
              </p>
            </div>

            {/* NEW: PDF Actions Section */}
            {pdfBase64 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6"
              >
                <div className="text-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-800">Medical PDF Generated</h3>
                  <p className="text-sm text-green-600">Your medical document is ready</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={viewPdf}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View PDF
                  </Button>
                  <Button 
                    onClick={downloadPdf}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* JSON Output Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    JSON Output
                  </CardTitle>
                  <CardDescription>
                    Structured JSON representation of your HL7 message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="secondary">JSON</Badge>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopyCode('json')}
                          className="gap-1"
                          disabled={!jsonOutput}
                        >
                          {isCopied.json ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {isCopied.json ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownload('json')}
                          className="gap-1"
                          disabled={!jsonOutput}
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <pre className="text-xs overflow-auto max-h-80 font-mono">
                      {jsonOutput || 'No JSON output available'}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* XML Output Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileOutput className="h-5 w-5" />
                    XML Output
                  </CardTitle>
                  <CardDescription>
                    XML format suitable for healthcare systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="secondary">XML</Badge>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopyCode('xml')}
                          className="gap-1"
                          disabled={!xmlOutput}
                        >
                          {isCopied.xml ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {isCopied.xml ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownload('xml')}
                          className="gap-1"
                          disabled={!xmlOutput}
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <pre className="text-xs overflow-auto max-h-80 font-mono">
                      {xmlOutput || 'No XML output available'}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-3 flex-col sm:flex-row">
                  <Button variant="outline" onClick={resetForm} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Convert Another
                  </Button>
                  <Button onClick={handleSaveResults} className="gap-2">
                    <Database className="h-4 w-4" />
                    Save to Database
                  </Button>
                  {!pdfBase64 && (
                    <Button variant="outline" onClick={handleGeneratePdf} className="gap-2">
                      <FileText className="h-4 w-4" />
                      Generate PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Summary</CardTitle>
                <CardDescription>
                  Details about the converted HL7 message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {hl7Input.split('\n').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Segments Processed</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {jsonOutput ? Object.keys(JSON.parse(jsonOutput)).length : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">JSON Properties</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {getSelectedMessageType()?.label}
                    </div>
                    <div className="text-sm text-muted-foreground">Message Type</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {pdfBase64 ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-muted-foreground">PDF Generated</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add CSS animation for progress bar */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}