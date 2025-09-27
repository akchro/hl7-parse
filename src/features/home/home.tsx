"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  FileText,
  Link as LinkIcon,
  Users,
  Search,
  Mail,
  Zap,
  CheckCircle,
  Upload,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/home-bar"
import { Link } from "@tanstack/react-router"

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")

  const processSteps = [
    {
      step: "1",
      title: "Upload Resume",
      description: "Upload your PDF resume or LaTeX code",
      icon: Upload,
    },
    {
      step: "2",
      title: "Convert to ATS Format",
      description: "AI converts your resume to optimized LaTeX format",
      icon: FileText,
    },
    {
      step: "3",
      title: "Analyze Job Description",
      description: "Paste job link for AI analysis and keyword extraction",
      icon: LinkIcon,
    },
    {
      step: "4",
      title: "Optimize Resume",
      description: "AI tailors your resume with targeted keywords",
      icon: Sparkles,
    },
    {
      step: "5",
      title: "Find Connections",
      description: "AI searches LinkedIn for company connections",
      icon: Search,
    },
    {
      step: "6",
      title: "Get Referral Email",
      description: "AI drafts professional referral request emails",
      icon: Mail,
    },
  ]

  const features = [
    {
      title: "ATS-Optimized Formatting",
      description:
        "Convert your resume to Applicant Tracking System-friendly LaTeX format that gets noticed",
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
    },
    {
      title: "Keyword Optimization",
      description:
        "AI analyzes job descriptions and strategically incorporates relevant keywords",
      icon: <Search className="h-6 w-6 text-primary" />,
    },
    {
      title: "LinkedIn Connection Finder",
      description:
        "Automatically find connections at target companies for referrals",
      icon: <Users className="h-6 w-6 text-primary" />,
    },
    {
      title: "Professional Email Drafts",
      description: "AI-generated professional emails for referral requests",
      icon: <Mail className="h-6 w-6 text-primary" />,
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Transform Your{" "}
                <span className="text-primary">Job Search</span> with AI
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Resume Refiner uses advanced AI to optimize your resume, find
                referrals, and draft professional emails—all automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-primary/10 rounded-2xl p-8 aspect-square flex items-center justify-center">
                <div className="relative">
                  <FileText className="h-24 w-24 text-primary mx-auto mb-6" />
                  <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full p-2">
                    <Zap className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* How It Works Section */}
        <motion.section
          className="py-20"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="text-center mb-16">
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              How <span className="text-primary">Resume Refiner</span> Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-xl max-w-3xl mx-auto"
            >
              Our AI-powered process transforms your job application strategy in
              six simple steps
            </motion.p>
          </div>

          {/* Workflow visualization */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {processSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="h-full flex flex-col items-center text-center p-6 shadow-sm">
                      <div className="mb-4 bg-primary/10 text-primary rounded-full p-4">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-lg">{`Step ${step.step}: ${step.title}`}</h3>
                      <p className="text-muted-foreground text-sm mt-2">
                        {step.description}
                      </p>
                    </Card>
                    {/* Connector line */}
                    {index < processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 right-[-24px] w-12 h-[2px] bg-muted" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.section>

        {/* Try It Out Section */}
        <motion.section 
          className="py-20"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-0">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Try It Now</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Upload your resume and job description to see how Resume Refiner can transform your application
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Resume (PDF or LaTeX)</label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {resumeFile ? resumeFile.name : "Click to upload or drag and drop"}
                      </p>
                      <Input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.tex"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Description URL</label>
                    <Input 
                      placeholder="Paste job description URL here"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Or paste job description</label>
                    <Textarea 
                      placeholder="Paste job description text here"
                      rows={5}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                  <Button className="w-full gap-2">
                    <Sparkles className="h-4 w-4" />
                    Optimize My Resume
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          className="py-20"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Powerful <span className="text-primary">Features</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Everything you need to stand out in today's competitive job market
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <Card className="h-full border-0 bg-muted/50 hover:bg-muted transition-colors">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="py-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {[
            { value: "3x", label: "More Interviews" },
            { value: "87%", label: "Success Rate" },
            { value: "2.5x", label: "Faster Hiring" },
            { value: "500+", label: "Jobs Optimized" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="py-20 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="bg-primary/10 rounded-2xl p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Job Search?</h2>
            <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have landed their dream roles with Resume Refiner
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}