"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Link as LinkIcon, Sparkles, FileText, Zap, Download, Eye, Code, FileDown, Copy, Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

interface OptimizationProps {
  onOptimize: (resumeFile: File | null, jobDescription: string, jobUrl: string) => Promise<string>
  onNext?: () => void
}

type OptimizationStage = 'input' | 'processing' | 'results'

export default function Optimization({ onOptimize, onNext }: OptimizationProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [jobUrl, setJobUrl] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [stage, setStage] = useState<OptimizationStage>('input')
  const [latexCode, setLatexCode] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && (file.type === "application/pdf" || file.name.endsWith(".tex"))) {
      setResumeFile(file)
    } else {
      alert("Please upload a PDF or LaTeX file")
    }
  }

  const handleOptimize = async () => {
    if (!resumeFile) {
      alert("Please upload a resume first")
      return
    }
    
    if (!jobDescription && !jobUrl) {
      alert("Please provide a job description or URL")
      return
    }
    
    setIsLoading(true)
    setStage('processing')
    
    try {
      // This is where you'll integrate with Gemini API
      // For now, we'll use a placeholder response
      const result = await onOptimize(resumeFile, jobDescription, jobUrl)
      setLatexCode(result)
      setStage('results')
    } catch (error) {
      console.error('Optimization failed:', error)
      alert('Optimization failed. Please try again.')
      setStage('input')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(latexCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownloadLatex = () => {
    const blob = new Blob([latexCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'optimized-resume.tex'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadPdf = () => {
    // This would typically call your backend to generate a PDF from the LaTeX
    alert('PDF download functionality would connect to your LaTeX compilation service')
  }

  const resetForm = () => {
    setStage('input')
    setResumeFile(null)
    setJobDescription("")
    setJobUrl("")
    setLatexCode("")
  }

  // Sample LaTeX preview (in a real app, this would be generated from the actual LaTeX)
  const sampleLatexPreview = `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{hyperref}

\\begin{document}

\\section*{John Doe}
\\subsection*{Senior Software Engineer}
\\textbf{Email:} john.doe@email.com | \\textbf{Phone:} (555) 123-4567

\\section*{Professional Summary}
Experienced software engineer with 5+ years specializing in full-stack development...

\\section*{Technical Skills}
\\begin{itemize}[leftmargin=*]
\\item \\textbf{Languages:} JavaScript, TypeScript, Python, Java
\\item \\textbf{Frameworks:} React, Node.js, Express, Django
\\item \\textbf{Tools:} Git, Docker, AWS, Jenkins
\\end{itemize}

\\section*{Experience}
\\textbf{Senior Developer} | Tech Company Inc. | 2020--Present
\\begin{itemize}[leftmargin=*]
\\item Led development of customer-facing web applications
\\item Improved system performance by 40% through optimization
\\item Mentored junior developers and conducted code reviews
\\end{itemize}

\\end{document}`

  return (
    <div className="space-y-6">
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
              <h2 className="text-3xl font-bold mb-4">Optimize Your Resume</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Upload your resume and provide the job description to get AI-powered optimization
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Resume Upload Section */}
              <motion.div variants={fadeUp} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Upload Resume
                    </CardTitle>
                    <CardDescription>
                      Upload your resume in PDF or LaTeX format for optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">File Upload</TabsTrigger>
                        <TabsTrigger value="latex">LaTeX Code</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upload" className="space-y-4">
                        <div 
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => document.getElementById('resume-upload')?.click()}
                        >
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            {resumeFile ? resumeFile.name : "Click to upload or drag and drop"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF or .tex files accepted
                          </p>
                          <Input 
                            id="resume-upload"
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.tex"
                            onChange={handleFileUpload}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="latex" className="space-y-4">
                        <Textarea 
                          placeholder="Paste your LaTeX code here..."
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab("upload")}
                        >
                          Or upload a file instead
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {resumeFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 p-4 rounded-lg flex items-center gap-3"
                  >
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{resumeFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResumeFile(null)}
                    >
                      Remove
                    </Button>
                  </motion.div>
                )}
              </motion.div>

              {/* Job Description Section */}
              <motion.div variants={fadeUp} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5" />
                      Job Description
                    </CardTitle>
                    <CardDescription>
                      Provide the job description URL or paste the content directly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Job Description URL</label>
                      <Input
                        placeholder="https://linkedin.com/jobs/view/123456789"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste the URL of the job posting
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Paste Job Description</label>
                      <Textarea
                        placeholder="Paste the job description here..."
                        rows={6}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Copy and paste the job description text
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleOptimize}
                  disabled={!resumeFile || (!jobDescription && !jobUrl)}
                >
                  <Sparkles className="h-5 w-5" />
                  Optimize My Resume
                </Button>

                {/* Tips Section */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4" />
                    Optimization Tips
                  </h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Ensure your resume is in a readable format with clear sections</li>
                    <li>• Include measurable achievements and specific results</li>
                    <li>• Provide the complete job description for best results</li>
                  </ul>
                </div>
              </motion.div>
            </div>
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
            <h3 className="text-xl font-semibold mb-2">Optimizing Your Resume</h3>
            <p className="text-muted-foreground text-center mb-6">
              Analyzing job requirements and enhancing your resume with AI...
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
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Resume Optimized Successfully!</h2>
              <p className="text-muted-foreground">
                Your resume has been enhanced with targeted keywords and ATS-friendly formatting
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preview Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Resume Preview
                  </CardTitle>
                  <CardDescription>
                    Preview your optimized resume (simulated view)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-6 h-96 overflow-auto">
                    <div className="font-serif text-sm">
                      <h1 className="text-2xl font-bold mb-2">John Doe</h1>
                      <h2 className="text-lg text-muted-foreground mb-4">Senior Software Engineer</h2>
                      
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">Professional Summary</h3>
                        <p className="text-sm">Experienced software engineer with 5+ years specializing in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions that improve performance by 40%.</p>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">Technical Skills</h3>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          <li>JavaScript, TypeScript, Python, Java</li>
                          <li>React, Node.js, Express, Django</li>
                          <li>AWS, Docker, Kubernetes, Jenkins</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Experience</h3>
                        <div className="mb-3">
                          <h4 className="font-medium">Senior Developer | Tech Company Inc. | 2020--Present</h4>
                          <ul className="text-sm list-disc list-inside space-y-1 mt-1">
                            <li>Led development of customer-facing web applications serving 1M+ users</li>
                            <li>Improved system performance by 40% through optimization</li>
                            <li>Mentored junior developers and conducted code reviews</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Download Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download Options
                  </CardTitle>
                  <CardDescription>
                    Download your optimized resume in your preferred format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button className="w-full gap-2" onClick={handleDownloadLatex}>
                      <Code className="h-4 w-4" />
                      Download LaTeX Code
                    </Button>
                    
                    <Button className="w-full gap-2" onClick={handleDownloadPdf}>
                      <FileDown className="h-4 w-4" />
                      Download PDF Version
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-2" onClick={handleCopyCode}>
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {isCopied ? 'Copied!' : 'Copy Code'}
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={resetForm}>
                        Optimize Another
                      </Button>
                      {onNext && (
                        <Button className="flex-1 gap-2" onClick={onNext}>
                          Next <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* LaTeX Code Preview */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">LaTeX Code Preview</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-auto max-h-40">
                      {sampleLatexPreview}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Optimization Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Summary</CardTitle>
                <CardDescription>
                  Key improvements made to your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">12</div>
                    <div className="text-sm text-muted-foreground">Keywords Added</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">92%</div>
                    <div className="text-sm text-muted-foreground">ATS Score</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">5</div>
                    <div className="text-sm text-muted-foreground">Sections Enhanced</div>
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