import { useState } from 'react'
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
import { FileText, Users, Mail, Zap, CheckCircle, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'
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

export default function Dashboard() {
  const [activeView, setActiveView] = useState('overview') // 'overview', 'optimization', 'connections', 'referral'
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    resumeFile: null,
    jobDescription: '',
    jobUrl: '',
    optimizedResume: null,
    selectedConnection: null,
    emailTemplate: null
  })

  // Tab order for workflow
  const workflowViews = ['optimization', 'connections', 'referral']
  const currentViewIndex = workflowViews.indexOf(activeView)
  const isWorkflowView = workflowViews.includes(activeView)

  const handleOptimize = async (resumeFile: File | null, jobDescription: string, jobUrl: string): Promise<string> => {
    console.log('Optimizing resume:', {
      resumeFile: resumeFile?.name,
      jobDescriptionLength: jobDescription.length,
      jobUrl
    })

    // Store the input data
    setWorkflowData(prev => ({
      ...prev,
      resumeFile,
      jobDescription,
      jobUrl
    }))

    // Simulate API call - in real app, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Sample optimized LaTeX resume
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

    // Store the optimized resume
    setWorkflowData(prev => ({
      ...prev,
      optimizedResume: optimizedLatex
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
      // If we're on the first workflow view, go back to overview
      setActiveView('overview')
    }
  }

  const handleSendMessage = (connection: any) => {
    console.log('Sending message to:', connection.name)
    setWorkflowData(prev => ({
      ...prev,
      selectedConnection: connection
    }))
  }

  const handleFindMore = () => {
    console.log('Finding more connections')
  }

  const handleSendEmail = (email: string, connectionName: string) => {
    console.log('Sending email to:', connectionName)
    console.log('Email content:', email)
    setWorkflowData(prev => ({
      ...prev,
      emailTemplate: email
    }))
  }

  const handleRegenerate = () => {
    console.log('Regenerating email template')
  }

  const handleStartWorkflow = () => {
    setActiveView('optimization')
    // Reset workflow data when starting a new workflow
    setWorkflowData({
      resumeFile: null,
      jobDescription: '',
      jobUrl: '',
      optimizedResume: null,
      selectedConnection: null,
      emailTemplate: null
    })
  }

  // Extract company name from job description or URL for consistency
  const getCompanyName = () => {
    // In a real app, you'd extract this from the job description or URL
    return "Google" // Placeholder
  }

  const getJobTitle = () => {
    // In a real app, you'd extract this from the job description or URL  
    return "Senior Software Engineer" // Placeholder
  }

  const getConnectionName = () => {
    return workflowData.selectedConnection?.name || "Sarah Johnson" // Use selected connection or default
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
          <h1 className='text-2xl font-bold tracking-tight'>Resume Analytics Dashboard</h1>
          <div className='flex items-center space-x-2'>
            <Button onClick={handleStartWorkflow}>New Resume</Button>
          </div>
        </div>

        {/* Progress Indicator - Only show for workflow views */}
        {isWorkflowView && (
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {workflowViews.map((view, index) => (
                <div key={view} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    index <= currentViewIndex 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {index < currentViewIndex ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm ${
                    index <= currentViewIndex ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {view === 'optimization' ? 'Optimize Resume' : 
                     view === 'connections' ? 'Find Connections' : 
                     'Send Referral Email'}
                  </span>
                  {index < workflowViews.length - 1 && (
                    <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />
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
                    Resumes Optimized
                  </CardTitle>
                  <FileText className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>42</div>
                  <p className='text-muted-foreground text-xs'>
                    +8 from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    ATS Score Improvement
                  </CardTitle>
                  <CheckCircle className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>87%</div>
                  <p className='text-muted-foreground text-xs'>
                    Average increase per resume
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Connections Found
                  </CardTitle>
                  <Users className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>156</div>
                  <p className='text-muted-foreground text-xs'>
                    Across target companies
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Emails Sent
                  </CardTitle>
                  <Mail className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>89</div>
                  <p className='text-muted-foreground text-xs'>
                    72% response rate
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Resume Performance Trends</CardTitle>
                  <CardDescription>
                    ATS score improvements over time
                  </CardDescription>
                </CardHeader>
                <CardContent className='pl-2'>
                  <div className='flex items-center justify-center h-80 bg-muted/20 rounded-lg'>
                    <div className='text-center text-muted-foreground'>
                      <Zap className='h-12 w-12 mx-auto mb-4' />
                      <p>Performance chart visualization</p>
                      <p className='text-sm'>Tracking ATS score improvements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Optimizations</CardTitle>
                  <CardDescription>
                    Latest resume improvements and results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {[
                      { company: "Google", score: "92%", keywords: 12, time: "2 hours ago" },
                      { company: "Microsoft", score: "88%", keywords: 9, time: "1 day ago" },
                      { company: "Amazon", score: "95%", keywords: 14, time: "2 days ago" },
                      { company: "Netflix", score: "85%", keywords: 8, time: "3 days ago" },
                      { company: "Apple", score: "90%", keywords: 11, time: "4 days ago" }
                    ].map((item, index) => (
                      <div key={index} className='flex items-center justify-between p-3 rounded-lg bg-muted/30'>
                        <div className='flex items-center space-x-3'>
                          <div className='bg-primary/10 p-2 rounded-full'>
                            <Sparkles className='h-4 w-4 text-primary' />
                          </div>
                          <div>
                            <p className='font-medium'>{item.company}</p>
                            <p className='text-sm text-muted-foreground'>{item.keywords} keywords added</p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-bold text-primary'>{item.score}</p>
                          <p className='text-xs text-muted-foreground'>{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Optimization View */}
        {activeView === 'optimization' && (
          <div className='space-y-4'>
            <Optimization 
              onOptimize={handleOptimize} 
              onNext={handleNextStep}
            />
            
            {/* Navigation buttons for Optimization view */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={handlePrevStep} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Overview
              </Button>
              <Button 
                onClick={handleNextStep} 
                className="gap-2"
                disabled={!workflowData.optimizedResume}
              >
                Next: Find Connections
                <ArrowRight className="h-4 w-4" />
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
            
            {/* Navigation buttons for Connections view */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={handlePrevStep} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Optimization
              </Button>
              <Button 
                onClick={handleNextStep} 
                className="gap-2"
                disabled={!workflowData.selectedConnection}
              >
                Next: Referral Email
                <ArrowRight className="h-4 w-4" />
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
            
            {/* Navigation buttons for Referral view */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={handlePrevStep} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Connections
              </Button>
              <Button 
                onClick={() => {
                  console.log('Workflow completed!', workflowData)
                  setActiveView('overview')
                  alert('Workflow completed! Check console for saved data.')
                }}
                className="gap-2"
              >
                Complete Workflow
                <CheckCircle className="h-4 w-4" />
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
    title: 'Resume Library',
    href: './resumes',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Connections',
    href: './connections',
    isActive: false,
    disabled: false,
  },
]