import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Loader2,
  Save,
  Download,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Edit,
  X,
  User,
  Calendar,
  FileText,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface SavedConversion {
  id: string
  title?: string
  description?: string
  original_hl7_content: string
  json_content?: Record<string, any>
  xml_content?: string
  plain_english?: string
  conversion_metadata?: Record<string, any>
  user_id?: string
  created_at: string
  updated_at: string
}

export function Analytics() {
  const navigate = useNavigate()
  const [conversions, setConversions] = useState<SavedConversion[]>([])
  const [selectedConversion, setSelectedConversion] =
    useState<SavedConversion | null>(null)
  const [editedConversion, setEditedConversion] =
    useState<SavedConversion | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch saved conversions
  useEffect(() => {
    fetchConversions()
  }, [])

  const fetchConversions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/v1/conversions/list')

      if (!response.ok) {
        throw new Error(`Failed to fetch conversions: ${response.status}`)
      }

      const data = await response.json()
      setConversions(data.conversions)

      // Select the first conversion by default
      if (data.conversions.length > 0) {
        setSelectedConversion(data.conversions[0])
        setEditedConversion(data.conversions[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching conversions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConversionSelect = (conversion: SavedConversion) => {
    setSelectedConversion(conversion)
    setEditedConversion(conversion)
    setIsEditing(false)
    setActiveTab('overview')
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditedConversion(selectedConversion)
    }
    setIsEditing(!isEditing)
  }

  const handleFieldChange = (field: keyof SavedConversion, value: any) => {
    if (!editedConversion) return

    setEditedConversion({
      ...editedConversion,
      [field]: value,
    })
  }

  const handleContentChange = (
    content: string,
    format: 'hl7' | 'json' | 'xml' | 'plain'
  ) => {
    if (!editedConversion) return

    try {
      setEditedConversion({
        ...editedConversion,
        ...(format === 'hl7' && { original_hl7_content: content }),
        ...(format === 'json' && {
          json_content: content ? JSON.parse(content) : null,
        }),
        ...(format === 'xml' && { xml_content: content }),
        ...(format === 'plain' && { plain_english: content }),
      })
      
      // Clear error when content is successfully updated
      if (format === 'json' && content) {
        setError(null)
      }
    } catch (err) {
      if (format === 'json') {
        setError('Invalid JSON format. Please check your JSON syntax.')
        console.error('JSON parsing error:', err)
      }
    }
  }

  const handleSave = async () => {
    if (!editedConversion) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/v1/conversions/${editedConversion.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hl7_content: editedConversion.original_hl7_content,
            title: editedConversion.title,
            description: editedConversion.description,
            json_content: editedConversion.json_content,
            xml_content: editedConversion.xml_content,
            plain_english: editedConversion.plain_english,
            conversion_metadata: editedConversion.conversion_metadata,
            user_id: editedConversion.user_id,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.detail || errorData.message || `Failed to update conversion (${response.status})`)
      }

      const updatedConversion = await response.json()

      // Update local state
      setConversions(
        conversions.map((conv) =>
          conv.id === editedConversion.id ? updatedConversion : conv
        )
      )
      setSelectedConversion(updatedConversion)
      setEditedConversion(updatedConversion)
      setIsEditing(false)
      setSaveSuccess(true)

      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
      console.error('Error saving conversion:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateJsonContent = async (jsonContent: Record<string, any>) => {
    if (!selectedConversion) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/v1/conversions/${selectedConversion.id}/json`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            json_content: jsonContent,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update JSON content')
      }

      const updatedConversion = await response.json()

      // Update local state
      setConversions(
        conversions.map((conv) =>
          conv.id === selectedConversion.id ? updatedConversion : conv
        )
      )
      setSelectedConversion(updatedConversion)
      setEditedConversion(updatedConversion)
      setSaveSuccess(true)

      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError('Failed to update JSON content')
      console.error('Error updating JSON content:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = (format: 'hl7' | 'json' | 'xml' | 'plain') => {
    if (!selectedConversion) return

    let content = ''
    let filename = `conversion-${selectedConversion.id}`
    let mimeType = 'text/plain'

    switch (format) {
      case 'hl7':
        content = selectedConversion.original_hl7_content
        filename += '.hl7'
        break
      case 'json':
        content = selectedConversion.json_content
          ? JSON.stringify(selectedConversion.json_content, null, 2)
          : '{}'
        filename += '.json'
        mimeType = 'application/json'
        break
      case 'xml':
        content = selectedConversion.xml_content || ''
        filename += '.xml'
        mimeType = 'application/xml'
        break
      case 'plain':
        content = selectedConversion.plain_english || ''
        filename += '.txt'
        mimeType = 'text/plain'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const getPatientInfoFromHL7 = (hl7Content: string) => {
    const lines = hl7Content.split('\n')
    let patientName = 'Unknown Patient'
    let patientId = 'Unknown ID'

    for (const line of lines) {
      if (line.trim().startsWith('PID')) {
        const segments = line.split('|')
        if (segments.length >= 6) {
          const nameSegment = segments[5]
          const idSegment = segments[3]

          if (nameSegment && nameSegment !== '') {
            const nameParts = nameSegment.split('^')
            if (nameParts.length >= 2) {
              // Format: LAST^FIRST^MIDDLE, so display as FIRST LAST
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

    return { patientName, patientId }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='text-primary h-8 w-8 animate-spin' />
          <p className='text-muted-foreground'>Loading conversions...</p>
        </div>
      </div>
    )
  }

  if (error && conversions.length === 0) {
    return (
      <div className='container mx-auto p-6'>
        <Card>
          <CardContent className='pt-6 text-center'>
            <AlertCircle className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <h2 className='mb-2 text-xl font-semibold'>
              Error Loading Conversions
            </h2>
            <p className='text-muted-foreground mb-4'>{error}</p>
            <Button onClick={fetchConversions}>
              <Loader2 className='mr-2 h-4 w-4' />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <div className='container mx-auto space-y-6 p-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex items-center justify-between'
        >
          <div>
            <Button
              variant='outline'
              onClick={() => navigate({ to: '/workflow' })}
              className='mb-4'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Patients
            </Button>
            <h1 className='text-3xl font-bold'>Conversion Analytics</h1>
            <p className='text-muted-foreground'>
              View and edit saved HL7 conversions
            </p>
          </div>

          {selectedConversion && (
            <div className='flex items-center gap-2'>
              <Button
                variant={isEditing ? 'outline' : 'default'}
                onClick={handleEditToggle}
                disabled={isSaving}
              >
                {isEditing ? (
                  <X className='mr-2 h-4 w-4' />
                ) : (
                  <Edit className='mr-2 h-4 w-4' />
                )}
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>

              {isEditing && (
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Save className='mr-2 h-4 w-4' />
                  )}
                  Save
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {saveSuccess && (
          <Alert variant='default' className='border-green-200 bg-green-50'>
            <CheckCircle className='h-4 w-4 text-green-600' />
            <AlertDescription className='text-green-800'>
              Conversion updated successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]'>
          {/* Conversions List Sidebar */}
          <div className='w-full flex-shrink-0 lg:w-[380px]'>
            <Card className='w-full'>
              <CardHeader className='p-4'>
                <CardTitle className='text-sm'>Saved Conversions</CardTitle>
                <CardDescription className='text-xs'>
                  {conversions.length} conversion
                  {conversions.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className='p-0'>
                <ScrollArea className='h-[600px] w-full'>
                  <div className='flex flex-col gap-1 px-2 py-2'>
                    {conversions.map((conversion) => {
                      const { patientName } = getPatientInfoFromHL7(
                        conversion.original_hl7_content
                      )
                      const isSelected =
                        selectedConversion?.id === conversion.id

                      return (
                        <div key={conversion.id} className='w-full'>
                          <Card
                            data-selected={isSelected ? 'true' : 'false'}
                            className={`group w-full cursor-pointer overflow-hidden border transition-colors focus-visible:ring-1 focus-visible:outline-none ${
                              isSelected
                                ? 'bg-muted/70 border-primary'
                                : 'hover:bg-muted/40'
                            }`}
                            onClick={() => handleConversionSelect(conversion)}
                          >
                            <CardContent className='px-3 py-2'>
                              <div className='flex w-full items-start gap-2'>
                                <User className='text-muted-foreground mt-0.5 h-3 w-3 shrink-0' />
                                <div className='min-w-0 flex-1 space-y-0.5'>
                                  <p
                                    className='truncate text-sm font-medium'
                                    title={patientName}
                                  >
                                    {patientName}
                                  </p>
                                  <p
                                    className='text-muted-foreground truncate text-[11px]'
                                    title={
                                      conversion.title || 'Untitled Conversion'
                                    }
                                  >
                                    {conversion.title || 'Untitled Conversion'}
                                  </p>
                                  <div className='flex items-center gap-1'>
                                    <Calendar className='text-muted-foreground h-3 w-3 shrink-0' />
                                    <span className='text-muted-foreground text-[10px]'>
                                      {new Date(
                                        conversion.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className='flex shrink-0 gap-1'>
                                  {conversion.json_content && (
                                    <Badge
                                      variant='secondary'
                                      className='px-1 py-0 text-[10px] leading-tight'
                                    >
                                      J
                                    </Badge>
                                  )}
                                  {conversion.xml_content && (
                                    <Badge
                                      variant='secondary'
                                      className='px-1 py-0 text-[10px] leading-tight'
                                    >
                                      X
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )
                    })}

                    {conversions.length === 0 && (
                      <div className='text-muted-foreground py-8 text-center text-xs'>
                        No conversions found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Details */}
          <div className='min-w-0'>
            {selectedConversion ? (
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle>
                        {isEditing ? (
                          <Input
                            value={editedConversion?.title || ''}
                            onChange={(e) =>
                              handleFieldChange('title', e.target.value)
                            }
                            placeholder='Conversion Title'
                            className='text-2xl font-bold'
                          />
                        ) : (
                          selectedConversion.title || 'Untitled Conversion'
                        )}
                      </CardTitle>
                      <CardDescription>
                        {isEditing ? (
                          <Input
                            value={editedConversion?.description || ''}
                            onChange={(e) =>
                              handleFieldChange('description', e.target.value)
                            }
                            placeholder='Conversion Description'
                            className='mt-1'
                          />
                        ) : (
                          selectedConversion.description || 'No description'
                        )}
                      </CardDescription>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline'>
                        <User className='mr-1 h-3 w-3' />
                        {selectedConversion.user_id || 'System'}
                      </Badge>
                      <Badge variant='secondary'>
                        <Calendar className='mr-1 h-3 w-3' />
                        {new Date(
                          selectedConversion.created_at
                        ).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className='space-y-4'
                  >
                    <TabsList className='grid w-full grid-cols-5'>
                      <TabsTrigger value='overview'>Overview</TabsTrigger>
                      <TabsTrigger value='hl7'>HL7 Content</TabsTrigger>
                      <TabsTrigger
                        value='json'
                        disabled={!selectedConversion.json_content}
                      >
                        JSON
                      </TabsTrigger>
                      <TabsTrigger
                        value='xml'
                        disabled={!selectedConversion.xml_content}
                      >
                        XML
                      </TabsTrigger>
                      <TabsTrigger
                        value='plain'
                        disabled={!selectedConversion.plain_english}
                      >
                        Plain text
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value='overview' className='space-y-4'>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <Card>
                          <CardHeader>
                            <CardTitle className='text-lg'>
                              Patient Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {(() => {
                              const { patientName, patientId } =
                                getPatientInfoFromHL7(
                                  selectedConversion.original_hl7_content
                                )
                              return (
                                <div className='space-y-2'>
                                  <div>
                                    <Label>Patient Name</Label>
                                    <p className='font-medium'>{patientName}</p>
                                  </div>
                                  <div>
                                    <Label>Patient ID</Label>
                                    <p className='font-medium'>{patientId}</p>
                                  </div>
                                </div>
                              )
                            })()}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className='text-lg'>
                              Conversion Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className='space-y-2'>
                              <div>
                                <Label>Available Formats</Label>
                                <div className='mt-1 flex gap-2'>
                                  <Badge variant='secondary'>HL7</Badge>
                                  {selectedConversion.json_content && (
                                    <Badge variant='secondary'>JSON</Badge>
                                  )}
                                  {selectedConversion.xml_content && (
                                    <Badge variant='secondary'>XML</Badge>
                                  )}
                                  {selectedConversion.plain_english && (
                                    <Badge variant='secondary'>Plain text</Badge>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label>HL7 Content Length</Label>
                                <p>
                                  {
                                    selectedConversion.original_hl7_content
                                      .length
                                  }{' '}
                                  characters
                                </p>
                              </div>
                              <div>
                                <Label>Last Updated</Label>
                                <p>
                                  {new Date(
                                    selectedConversion.updated_at
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className='flex gap-2'>
                        <Button
                          onClick={() => handleDownload('hl7')}
                          variant='outline'
                        >
                          <Download className='mr-2 h-4 w-4' />
                          Download HL7
                        </Button>
                        {selectedConversion.json_content && (
                          <Button
                            onClick={() => handleDownload('json')}
                            variant='outline'
                          >
                            <Download className='mr-2 h-4 w-4' />
                            Download JSON
                          </Button>
                        )}
                        {selectedConversion.xml_content && (
                          <Button
                            onClick={() => handleDownload('xml')}
                            variant='outline'
                          >
                            <Download className='mr-2 h-4 w-4' />
                            Download XML
                          </Button>
                        )}
                        {selectedConversion.plain_english && (
                          <Button
                            onClick={() => handleDownload('plain')}
                            variant='outline'
                          >
                            <Download className='mr-2 h-4 w-4' />
                            Download Plain text
                          </Button>
                        )}
                      </div>
                    </TabsContent>

                    {/* HL7 Content Tab */}
                    <TabsContent value='hl7'>
                      <Card>
                        <CardHeader>
                          <CardTitle>HL7 Message Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isEditing ? (
                            <Textarea
                              value={
                                editedConversion?.original_hl7_content || ''
                              }
                              onChange={(e) =>
                                handleContentChange(e.target.value, 'hl7')
                              }
                              className='min-h-[400px] font-mono text-sm'
                              placeholder='HL7 message content...'
                            />
                          ) : (
                            <ScrollArea className='h-[400px]'>
                              <pre className='font-mono text-sm whitespace-pre-wrap'>
                                {selectedConversion.original_hl7_content}
                              </pre>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* JSON Tab */}
                    <TabsContent value='json'>
                      <Card>
                        <CardHeader>
                          <div className='flex items-center justify-between'>
                            <CardTitle>JSON Conversion</CardTitle>
                            {!isEditing && (
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  if (editedConversion?.json_content) {
                                    handleUpdateJsonContent(
                                      editedConversion.json_content
                                    )
                                  }
                                }}
                                disabled={
                                  isSaving || !editedConversion?.json_content
                                }
                              >
                                {isSaving ? (
                                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                  <Save className='mr-2 h-4 w-4' />
                                )}
                                Update JSON
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isEditing ? (
                            <div className='space-y-4'>
                              <Textarea
                                value={
                                  editedConversion?.json_content
                                    ? JSON.stringify(
                                        editedConversion.json_content,
                                        null,
                                        2
                                      )
                                    : ''
                                }
                                onChange={(e) =>
                                  handleContentChange(e.target.value, 'json')
                                }
                                className='min-h-[400px] font-mono text-sm'
                                placeholder='JSON content...'
                              />
                              <Button
                                onClick={() => {
                                  if (editedConversion?.json_content) {
                                    handleUpdateJsonContent(
                                      editedConversion.json_content
                                    )
                                  }
                                }}
                                disabled={
                                  isSaving || !editedConversion?.json_content
                                }
                                className='w-full'
                              >
                                {isSaving ? (
                                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                  <Save className='mr-2 h-4 w-4' />
                                )}
                                Update JSON Content Only
                              </Button>
                            </div>
                          ) : (
                            <ScrollArea className='h-[400px]'>
                              <pre className='font-mono text-sm'>
                                {JSON.stringify(
                                  selectedConversion.json_content,
                                  null,
                                  2
                                )}
                              </pre>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* XML Tab */}
                    <TabsContent value='xml'>
                      <Card>
                        <CardHeader>
                          <CardTitle>XML Conversion</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isEditing ? (
                            <Textarea
                              value={editedConversion?.xml_content || ''}
                              onChange={(e) =>
                                handleContentChange(e.target.value, 'xml')
                              }
                              className='min-h-[400px] font-mono text-sm'
                              placeholder='XML content...'
                            />
                          ) : (
                            <ScrollArea className='h-[400px]'>
                              <pre className='font-mono text-sm'>
                                {selectedConversion.xml_content}
                              </pre>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Plain text Tab */}
                    <TabsContent value='plain'>
                      <Card>
                        <CardHeader>
                          <CardTitle>Plain Text Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isEditing ? (
                            <Textarea
                              value={editedConversion?.plain_english || ''}
                              onChange={(e) =>
                                handleContentChange(e.target.value, 'plain')
                              }
                              className='min-h-[400px] text-sm'
                              placeholder='Plain text content...'
                            />
                          ) : (
                            <ScrollArea className='h-[400px]'>
                              <div className='whitespace-pre-wrap text-sm'>
                                {selectedConversion.plain_english}
                              </div>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className='pt-6 text-center'>
                  <FileText className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                  <h3 className='mb-2 text-lg font-semibold'>
                    No Conversion Selected
                  </h3>
                  <p className='text-muted-foreground'>
                    Select a conversion from the list to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const topNav = [
  {
    title: 'Dashboard',
    href: '/dash',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Conversions',
    href: '/hl7-converter',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Patient Data',
    href: '/workflow/analytics',
    isActive: false,
    disabled: false,
  },
  {
    title: 'HL7 Library',
    href: '/workflow',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Analytics',
    href: '/workflow/pdf',
    isActive: false,
    disabled: false,
  },
]
