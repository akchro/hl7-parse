import { useState } from 'react'
import {
  FileText,
  Users,
  Mail,
  Zap,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import Optimization from './components/optimization'
import Reconnect from './components/reconnect'
import Referral from './components/referal'

// Workflow data interface
interface WorkflowData {
  resumeFile: File | null
  jobDescription: string
  jobUrl: string
  optimizedResume: string | null
  selectedConnection: any | null
  emailTemplate: string | null
}

// HL7 Conversion data interface
interface HL7ConversionData {
  hl7Input: string
  jsonOutput: string
  xmlOutput: string
  isLoading: boolean
  isSaving: boolean
  error: string | null
  success: boolean
  saveSuccess: boolean
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState('overview') // 'overview', 'optimization', 'connections', 'referral'
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    resumeFile: null,
    jobDescription: '',
    jobUrl: '',
    optimizedResume: null,
    selectedConnection: null,
    emailTemplate: null,
  })

  const [hl7Data, setHl7Data] = useState<HL7ConversionData>({
    hl7Input: '',
    jsonOutput: '',
    xmlOutput: '',
    isLoading: false,
    isSaving: false,
    error: null,
    success: false,
    saveSuccess: false,
  })

  // Tab order for workflow
  const workflowViews = ['optimization', 'connections', 'referral']
  const currentViewIndex = workflowViews.indexOf(activeView)
  const isWorkflowView = workflowViews.includes(activeView)

  // HL7 Conversion Functions
  const handleConvert = async () => {
    if (!hl7Data.hl7Input.trim()) {
      setHl7Data((prev) => ({
        ...prev,
        error: 'Please enter HL7 text before converting.',
      }))
      return
    }

    setHl7Data((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      success: false,
      jsonOutput: '',
      xmlOutput: '',
    }))

    try {
      const response = await fetch('/api/v1/mastra/convert/both', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hl7_content: hl7Data.hl7Input,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${data.detail || 'Unknown error'}`
        )
      }

      if (data.success) {
        const jsonOutput = data.data.json?.success
          ? JSON.stringify(data.data.json.content, null, 2)
          : `Error: ${data.data.json?.error || 'JSON conversion failed'}`

        const xmlOutput = data.data.xml?.success
          ? data.data.xml.content
          : `Error: ${data.data.xml?.error || 'XML conversion failed'}`

        setHl7Data((prev) => ({
          ...prev,
          jsonOutput,
          xmlOutput,
          success: true,
        }))
      } else {
        throw new Error(data.message || 'Conversion failed')
      }
    } catch (err) {
      console.error('Conversion error:', err)
      setHl7Data((prev) => ({
        ...prev,
        error: `Conversion failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        jsonOutput: 'Error occurred during conversion',
        xmlOutput: 'Error occurred during conversion',
      }))
    } finally {
      setHl7Data((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const loadSampleHL7 = () => {
    const sampleHL7 = `MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20230101120000||ADT^A01^ADT_A01|123456789|P|2.5
EVN||202301011200|||^USER^USER^^^^^^USER
PID|1||123456789^^^MRN^MR||DOE^JOHN^MIDDLE^^MR^||19850315|M|||123 MAIN ST^^ANYTOWN^NY^12345^USA||(555)123-4567|||||123-45-6789|||||||||||||||
PV1|1|I|ICU^101^01||||^DOCTOR^ATTENDING^^^MD||||||||||V123456789|||||||||||||||||||||||||202301011200|`

    setHl7Data((prev) => ({
      ...prev,
      hl7Input: sampleHL7,
      jsonOutput: '',
      xmlOutput: '',
      error: null,
      success: false,
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setHl7Data((prev) => ({ ...prev, success: true }))
      setTimeout(
        () => setHl7Data((prev) => ({ ...prev, success: false })),
        2000
      )
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleSaveToDatabase = async () => {
    if (
      !hl7Data.hl7Input.trim() ||
      ((!hl7Data.jsonOutput || hl7Data.jsonOutput.startsWith('Error')) &&
        (!hl7Data.xmlOutput || hl7Data.xmlOutput.startsWith('Error')))
    ) {
      setHl7Data((prev) => ({
        ...prev,
        error: 'Please convert the HL7 message successfully before saving.',
      }))
      return
    }

    setHl7Data((prev) => ({
      ...prev,
      isSaving: true,
      error: null,
      saveSuccess: false,
    }))

    try {
      let parsedJson = null
      if (hl7Data.jsonOutput && !hl7Data.jsonOutput.startsWith('Error')) {
        try {
          parsedJson = JSON.parse(hl7Data.jsonOutput)
        } catch (e) {
          console.error('Failed to parse JSON for saving:', e)
        }
      }

      const response = await fetch('/api/v1/conversions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hl7_content: hl7Data.hl7Input,
          json_content: parsedJson,
          xml_content:
            hl7Data.xmlOutput && !hl7Data.xmlOutput.startsWith('Error')
              ? hl7Data.xmlOutput
              : null,
          title: `HL7 Conversion - ${new Date().toLocaleString()}`,
          description: 'Converted using Gemini AI',
        }),
      })

      const data = await response.json()

      if (response.status === 409) {
        setHl7Data((prev) => ({
          ...prev,
          error: 'This HL7 message has already been saved to the database.',
        }))
        return
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${data.detail || 'Unknown error'}`
        )
      }

      if (data.success) {
        setHl7Data((prev) => ({ ...prev, saveSuccess: true }))
        setTimeout(
          () => setHl7Data((prev) => ({ ...prev, saveSuccess: false })),
          3000
        )
      } else {
        throw new Error(data.message || 'Save failed')
      }
    } catch (err) {
      console.error('Save error:', err)
      setHl7Data((prev) => ({
        ...prev,
        error: `Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }))
    } finally {
      setHl7Data((prev) => ({ ...prev, isSaving: false }))
    }
  }

  // Existing functions from your original code
  const handleOptimize = async (
    resumeFile: File | null,
    jobDescription: string,
    jobUrl: string
  ): Promise<string> => {
    console.log('Optimizing resume:', {
      resumeFile: resumeFile?.name,
      jobDescriptionLength: jobDescription.length,
      jobUrl,
    })

    setWorkflowData((prev) => ({
      ...prev,
      resumeFile,
      jobDescription,
      jobUrl,
    }))

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const optimizedLatex = `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{hyperref}

\\begin{document}

\\section*{John Doe}
\\subsection*{Senior Software Engineer}
\\textbf{Email:} john.doe@email.com | \\textbf{Phone:} (555) 123-4567

\\section*{Professional Summary}
Experienced software engineer with 5+ years specializing in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and improving system performance by 40%.

\\section*{Technical Skills}
\\begin{itemize}[leftmargin=*]
\\item \\textbf{Languages:} JavaScript, TypeScript, Python, Java
\\item \\textbf{Frameworks:} React, Node.js, Express, Django
\\item \\textbf{Cloud & Tools:} AWS, Docker, Kubernetes, Jenkins, Git
\\end{itemize}

\\section*{Experience}
\\textbf{Senior Developer} | Tech Company Inc. | 2020--Present
\\begin{itemize}[leftmargin=*]
\\item Led development of customer-facing web applications serving 1M+ users
\\item Improved system performance by 40% through code optimization and architecture redesign
\\item Mentored 5+ junior developers and established code review processes
\\item Implemented CI/CD pipelines reducing deployment time by 60%
\\end{itemize}

\\textbf{Software Engineer} | StartupCorp | 2018--2020
\\begin{itemize}[leftmargin=*]
\\item Built RESTful APIs and microservices handling 10K+ requests/minute
\\item Developed responsive web applications using React and modern JavaScript
\\item Collaborated with cross-functional teams in Agile development environment
\\end{itemize}

\\section*{Education}
\\textbf{Bachelor of Science in Computer Science} | University of Technology | 2018

\\section*{Certifications}
\\begin{itemize}[leftmargin=*]
\\item AWS Certified Solutions Architect
\\item Google Cloud Professional Developer
\\end{itemize}

\\end{document}`

    setWorkflowData((prev) => ({
      ...prev,
      optimizedResume: optimizedLatex,
    }))

    return optimizedLatex
  }

  const handleNextStep = () => {
    if (currentViewIndex < workflowViews.length - 1) {
      setActiveView(workflowViews[currentViewIndex + 1])
    }
  }

  const handlePrevStep = () => {
    if (currentViewIndex > 0) {
      setActiveView(workflowViews[currentViewIndex - 1])
    } else {
      setActiveView('overview')
    }
  }

  const handleSendMessage = (connection: any) => {
    console.log('Sending message to:', connection.name)
    setWorkflowData((prev) => ({
      ...prev,
      selectedConnection: connection,
    }))
  }

  const handleFindMore = () => {
    console.log('Finding more connections')
  }

  const handleSendEmail = (email: string, connectionName: string) => {
    console.log('Sending email to:', connectionName)
    console.log('Email content:', email)
    setWorkflowData((prev) => ({
      ...prev,
      emailTemplate: email,
    }))
  }

  const handleRegenerate = () => {
    console.log('Regenerating email template')
  }

  const handleStartWorkflow = () => {
    setActiveView('optimization')
    setWorkflowData({
      resumeFile: null,
      jobDescription: '',
      jobUrl: '',
      optimizedResume: null,
      selectedConnection: null,
      emailTemplate: null,
    })
  }

  const getCompanyName = () => {
    return 'Google'
  }

  const getJobTitle = () => {
    return 'Senior Software Engineer'
  }

  const getConnectionName = () => {
    return workflowData.selectedConnection?.name || 'Sarah Johnson'
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

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            HL7 LiteBoard Dashboard
          </h1>
          <div className='flex items-center space-x-2'>
            <Button onClick={handleStartWorkflow}>New Conversion</Button>
          </div>
        </div>

        {/* Progress Indicator - Only show for workflow views */}
        {isWorkflowView && (
          <div className='mb-6 flex items-center justify-center'>
            <div className='flex items-center space-x-4'>
              {workflowViews.map((view, index) => (
                <div key={view} className='flex items-center'>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      index <= currentViewIndex
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {index < currentViewIndex ? (
                      <CheckCircle className='h-4 w-4' />
                    ) : (
                      <span className='text-sm'>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      index <= currentViewIndex
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {view === 'optimization'
                      ? 'HL7 Input'
                      : view === 'connections'
                        ? 'Review Data'
                        : 'Export Results'}
                  </span>
                  {index < workflowViews.length - 1 && (
                    <ArrowRight className='text-muted-foreground mx-4 h-4 w-4' />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    HL7 Messages Converted
                  </CardTitle>
                  <FileText className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>156</div>
                  <p className='text-muted-foreground text-xs'>
                    +24 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Conversion Success Rate
                  </CardTitle>
                  <CheckCircle className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>94%</div>
                  <p className='text-muted-foreground text-xs'>
                    Successful conversions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Data Fields Processed
                  </CardTitle>
                  <Users className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>2,847</div>
                  <p className='text-muted-foreground text-xs'>
                    Patient data fields extracted
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Exports Generated
                  </CardTitle>
                  <Mail className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>89</div>
                  <p className='text-muted-foreground text-xs'>
                    PDF, JSON, and XML files
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* HL7 Converter Section - Replacing Resume Performance Trends */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>HL7 Message Converter</CardTitle>
                  <CardDescription>
                    Convert HL7 messages to JSON and XML formats using AI
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label
                      htmlFor='hl7Input'
                      className='text-foreground mb-2 block text-sm font-medium'
                    >
                      HL7 Input
                    </label>
                    <textarea
                      id='hl7Input'
                      value={hl7Data.hl7Input}
                      onChange={(e) =>
                        setHl7Data((prev) => ({
                          ...prev,
                          hl7Input: e.target.value,
                        }))
                      }
                      placeholder='Enter your HL7 message here...'
                      className='border-border bg-background text-foreground resize-vertical focus:ring-ring h-40 w-full rounded-md border p-4 font-mono text-sm focus:ring-2 focus:outline-none'
                    />
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      onClick={handleConvert}
                      disabled={hl7Data.isLoading || !hl7Data.hl7Input.trim()}
                      className='flex-1 gap-2'
                    >
                      {hl7Data.isLoading ? (
                        'Converting...'
                      ) : (
                        <>
                          <Zap className='h-4 w-4' />
                          Convert with AI
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={loadSampleHL7}
                      variant='outline'
                      className='gap-2'
                    >
                      <FileText className='h-4 w-4' />
                      Load Sample
                    </Button>
                  </div>

                  {hl7Data.error && (
                    <div className='bg-destructive/10 border-destructive/20 rounded-md border p-4'>
                      <p className='text-destructive text-sm'>
                        {hl7Data.error}
                      </p>
                    </div>
                  )}

                  {hl7Data.success && !hl7Data.error && (
                    <div className='rounded-md border border-green-200 bg-green-100 p-4'>
                      <p className='text-sm text-green-800'>
                        Conversion completed successfully!
                      </p>
                    </div>
                  )}

                  {hl7Data.saveSuccess && (
                    <div className='rounded-md border border-blue-200 bg-blue-100 p-4'>
                      <p className='text-sm text-blue-800'>
                        Successfully saved to database!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Conversions - Replacing Recent Optimizations */}
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Conversions</CardTitle>
                  <CardDescription>
                    Latest HL7 message conversions and results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {hl7Data.jsonOutput || hl7Data.xmlOutput ? (
                      <div className='space-y-4'>
                        <div>
                          <div className='mb-2 flex items-center justify-between'>
                            <label className='text-foreground block text-sm font-medium'>
                              JSON Output
                            </label>
                            {hl7Data.jsonOutput &&
                              !hl7Data.jsonOutput.startsWith('Error') && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() =>
                                    copyToClipboard(hl7Data.jsonOutput)
                                  }
                                  className='gap-1'
                                >
                                  <Copy className='h-3 w-3' />
                                  Copy
                                </Button>
                              )}
                          </div>
                          <div className='border-border bg-muted text-foreground h-32 overflow-auto rounded-md border p-3 font-mono text-xs'>
                            <pre>
                              {hl7Data.jsonOutput ||
                                'JSON output will appear here...'}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <div className='mb-2 flex items-center justify-between'>
                            <label className='text-foreground block text-sm font-medium'>
                              XML Output
                            </label>
                            {hl7Data.xmlOutput &&
                              !hl7Data.xmlOutput.startsWith('Error') && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() =>
                                    copyToClipboard(hl7Data.xmlOutput)
                                  }
                                  className='gap-1'
                                >
                                  <Copy className='h-3 w-3' />
                                  Copy
                                </Button>
                              )}
                          </div>
                          <div className='border-border bg-muted text-foreground h-32 overflow-auto rounded-md border p-3 font-mono text-xs'>
                            <pre>
                              {hl7Data.xmlOutput ||
                                'XML output will appear here...'}
                            </pre>
                          </div>
                        </div>

                        {(hl7Data.jsonOutput || hl7Data.xmlOutput) && (
                          <Button
                            onClick={handleSaveToDatabase}
                            disabled={hl7Data.isSaving}
                            className='w-full gap-2'
                          >
                            <Download className='h-4 w-4' />
                            {hl7Data.isSaving
                              ? 'Saving...'
                              : 'Save to Database'}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className='text-muted-foreground py-8 text-center'>
                        <FileText className='mx-auto mb-4 h-12 w-12 opacity-50' />
                        <p>Convert an HL7 message to see the results here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Optimization View */}
        {activeView === 'optimization' && (
          <div className='space-y-4'>
            <Optimization onOptimize={handleOptimize} onNext={handleNextStep} />

            <div className='flex justify-between border-t pt-6'>
              <Button
                variant='outline'
                onClick={handlePrevStep}
                className='gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                Back to Overview
              </Button>
              <Button
                onClick={handleNextStep}
                className='gap-2'
                disabled={!workflowData.optimizedResume}
              >
                Next: Review Data
                <ArrowRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}

        {/* Connections View */}
        {activeView === 'connections' && (
          <div className='space-y-4'>
            <Reconnect
              companyName={getCompanyName()}
              onSendMessage={handleSendMessage}
              onFindMore={handleFindMore}
            />

            <div className='flex justify-between border-t pt-6'>
              <Button
                variant='outline'
                onClick={handlePrevStep}
                className='gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                Back to HL7 Input
              </Button>
              <Button
                onClick={handleNextStep}
                className='gap-2'
                disabled={!workflowData.selectedConnection}
              >
                Next: Export Results
                <ArrowRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}

        {/* Referral Email View */}
        {activeView === 'referral' && (
          <div className='space-y-4'>
            <Referral
              companyName={getCompanyName()}
              jobTitle={getJobTitle()}
              connectionName={getConnectionName()}
              onSendEmail={handleSendEmail}
              onRegenerate={handleRegenerate}
            />

            <div className='flex justify-between border-t pt-6'>
              <Button
                variant='outline'
                onClick={handlePrevStep}
                className='gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                Back to Review Data
              </Button>
              <Button
                onClick={() => {
                  console.log('Workflow completed!', workflowData)
                  setActiveView('overview')
                  alert('Workflow completed! Check console for saved data.')
                }}
                className='gap-2'
              >
                Complete Workflow
                <CheckCircle className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </Main>
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
    title: 'HL7 Library',
    href: './conversions',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Patient Data',
    href: './patients',
    isActive: false,
    disabled: false,
  },
]
