import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Calendar, 
  FileText, 
  Clock, 
  RefreshCw,
  AlertCircle,
  User,
  Stethoscope
} from 'lucide-react'
import { format } from 'date-fns'

interface SavedConversion {
  id: string
  title?: string
  description?: string
  original_hl7_content: string
  json_content?: Record<string, unknown>
  xml_content?: string
  conversion_metadata?: Record<string, unknown>
  user_id?: string
  created_at: string
  updated_at: string
}

interface SavedConversionListResponse {
  conversions: SavedConversion[]
  total: number
  page: number
  per_page: number
}

interface TriageResult {
  patient_id: string
  patient_name: string
  severity_score: number
  priority_level: string
  clinical_summary: string
  key_findings: string[]
  recommended_timeline: string
  reasoning: string
}

interface TriageAnalysisResponse {
  success: boolean
  message: string
  data: TriageResult[]
  metadata: {
    patientsAnalyzed: number
    timestamp: string
    triageProtocols: string[]
  }
}

interface TriageProps {
  className?: string
}

export function Triage({ className }: TriageProps) {
  const [conversions, setConversions] = useState<SavedConversion[]>([])
  const [maxDisplayCount, setMaxDisplayCount] = useState(10)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [triageInProgress, setTriageInProgress] = useState(false)
  const [triageResults, setTriageResults] = useState<TriageResult[]>([])
  const [triageCompleted, setTriageCompleted] = useState(false)
  const [triageError, setTriageError] = useState<string | null>(null)

  const fetchPatientIntakes = useCallback(async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/v1/conversions/list')
      
      if (response.ok) {
        const data: SavedConversionListResponse = await response.json()
        // Sort by created_at descending and limit to maxDisplayCount
        const sortedConversions = data.conversions
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, maxDisplayCount)
        setConversions(sortedConversions)
      } else {
        console.error('Failed to fetch patient intakes')
      }
    } catch (error) {
      console.error('Error fetching patient intakes:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [maxDisplayCount])

  useEffect(() => {
    fetchPatientIntakes()
  }, [maxDisplayCount, fetchPatientIntakes])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'partial':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'ADT':
        return <Users className="h-4 w-4" />
      case 'ORU':
        return <FileText className="h-4 w-4" />
      case 'ORM':
        return <Stethoscope className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Function to extract patient information from HL7 content
  const getPatientInfoFromHL7 = (hl7Content: string) => {
    const lines = hl7Content.split('\n')
    let patientName = 'Unknown Patient'
    let patientId = 'Unknown ID'
    let messageType = 'Unknown'
    let triggerEvent = ''

    // Parse MSH segment for message type
    for (const line of lines) {
      if (line.trim().startsWith('MSH')) {
        const segments = line.split('|')
        if (segments.length >= 9) {
          const messageTypeField = segments[8]
          if (messageTypeField) {
            const parts = messageTypeField.split('^')
            if (parts.length >= 2) {
              messageType = parts[0]
              triggerEvent = parts[1]
            }
          }
        }
        break
      }
    }

    // Parse PID segment for patient information
    for (const line of lines) {
      if (line.trim().startsWith('PID')) {
        const segments = line.split('|')
        if (segments.length >= 6) {
          // PID|1||123456789^^^MRN^MR||DOE^JOHN^MIDDLE^^MR^
          const nameSegment = segments[5]
          const idSegment = segments[3]
          
          if (nameSegment && nameSegment !== '') {
            const nameParts = nameSegment.split('^')
            if (nameParts.length >= 2) {
              patientName = `${nameParts[1]} ${nameParts[0]}`.trim()
            }
          }
          
          if (idSegment && idSegment !== '') {
            const idParts = idSegment.split('^')
            if (idParts.length > 0) {
              patientId = idParts[0]
            }
          }
        }
        break
      }
    }

    return { patientName, patientId, messageType, triggerEvent }
  }

  const initiateTriage = useCallback(async () => {
    if (conversions.length === 0) return
    
    try {
      setTriageInProgress(true)
      setTriageError(null)
      setTriageCompleted(false)
      
      // Extract HL7 content from conversions
      const hl7Messages = conversions.map(conversion => conversion.original_hl7_content)
      
      const response = await fetch('/api/v1/mastra/triage-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hl7_messages: hl7Messages,
          patient_count: conversions.length
        })
      })
      
      if (!response.ok) {
        throw new Error(`Triage analysis failed: ${response.statusText}`)
      }
      
      const data: TriageAnalysisResponse = await response.json()
      
      if (data.success) {
        setTriageResults(data.data)
        setTriageCompleted(true)
      } else {
        throw new Error(data.message || 'Triage analysis failed')
      }
      
    } catch (error) {
      console.error('Error during triage analysis:', error)
      setTriageError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setTriageInProgress(false)
    }
  }, [conversions])

  const handleCountChange = (value: string) => {
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue > 0 && numValue <= 100) {
      setMaxDisplayCount(numValue)
      // Reset triage when count changes
      setTriageCompleted(false)
      setTriageResults([])
      setTriageError(null)
    }
  }

  const getSeverityColor = (score: number) => {
    if (score >= 90) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    if (score >= 80) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    if (score >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }

  const getSeverityIcon = (score: number) => {
    if (score >= 90) return '🚨'
    if (score >= 80) return '⚠️'
    if (score >= 70) return '📋'
    if (score >= 60) return '📝'
    return '✅'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Triage
            </CardTitle>
            <CardDescription>
              Recent patient intakes and HL7 message processing
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatientIntakes}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="max-count" className="text-sm font-medium">
                Display count:
              </Label>
              <Input
                id="max-count"
                type="number"
                min="1"
                max="100"
                value={maxDisplayCount}
                onChange={(e) => handleCountChange(e.target.value)}
                className="w-20"
                disabled={triageInProgress}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {conversions.length} most recent intakes
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {triageCompleted && (
              <Badge variant="outline" className="text-green-600">
                Triage Complete
              </Badge>
            )}
            <Button
              onClick={initiateTriage}
              disabled={triageInProgress || conversions.length === 0}
              className="gap-2"
            >
              {triageInProgress ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Stethoscope className="h-4 w-4" />
                  Initiate Triage
                </>
              )}
            </Button>
          </div>
        </div>

        {triageError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Triage Analysis Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{triageError}</p>
          </div>
        )}

        <Separator />

        {/* Patient Intakes List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading patient intakes...</span>
            </div>
          </div>
        ) : conversions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No patient intakes found</p>
            <p className="text-xs text-muted-foreground">Process some HL7 messages to see them here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {triageCompleted && triageResults.length > 0 ? (
                  // Show triage results sorted by severity
                  triageResults.map((result, index) => (
                    <motion.div
                      key={`triage-${result.patient_id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {result.patient_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {result.patient_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getSeverityColor(result.severity_score)}`}
                          >
                            {getSeverityIcon(result.severity_score)} {result.severity_score}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className="text-xs"
                          >
                            {result.priority_level}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium text-muted-foreground">Timeline:</span>
                          <span className="ml-2">{result.recommended_timeline}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium text-muted-foreground">Clinical Summary:</span>
                          <p className="text-sm mt-1">{result.clinical_summary}</p>
                        </div>
                        
                        {result.key_findings.length > 0 && (
                          <div>
                            <span className="font-medium text-muted-foreground">Key Findings:</span>
                            <ul className="list-disc list-inside mt-1 ml-2">
                              {result.key_findings.map((finding, i) => (
                                <li key={i} className="text-xs">{finding}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-2 p-2 bg-muted/30 rounded">
                          <span className="font-medium text-muted-foreground">Clinical Reasoning:</span>
                          <p className="text-xs mt-1">{result.reasoning}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  // Show regular patient list
                  conversions.map((conversion, index) => {
                    const { patientName, patientId, messageType, triggerEvent } = getPatientInfoFromHL7(conversion.original_hl7_content)
                    
                    return (
                      <motion.div
                        key={`conversion-${conversion.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">
                                {patientName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ID: {patientId}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          >
                            Processed
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              {getMessageTypeIcon(messageType)}
                              <span className="font-medium">{messageType}</span>
                              {triggerEvent && (
                                <span className="text-muted-foreground">({triggerEvent})</span>
                              )}
                            </div>
                            
                            {conversion.title && (
                              <div className="text-muted-foreground">
                                Title: {conversion.title}
                              </div>
                            )}
                            
                            <div className="text-muted-foreground">
                              User: {conversion.user_id || 'System'}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className="text-muted-foreground">
                                {format(new Date(conversion.created_at), 'MMM dd, HH:mm')}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span>
                                Available: {conversion.json_content ? 'JSON' : ''} {conversion.xml_content ? 'XML' : ''}
                              </span>
                            </div>
                            
                            <div className="text-muted-foreground">
                              Size: {Math.round(conversion.original_hl7_content.length / 1024)}KB
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}