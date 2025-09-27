"use client"

import { motion } from "framer-motion"
import {
  Download,
  Shield,
  FileText,
  Lock,
  CheckCircle,
  ArrowRight,
  Play,
  Zap,
  FileCode,
  FileArchive
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Navbar } from "@/components/home-bar"
import { Footer } from "@/components/footer"
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

export default function SecureExportPage() {
  const exportFeatures = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "PDF Reports",
      description: "Generate professional patient summaries and discharge documents"
    },
    {
      icon: <FileCode className="h-6 w-6" />,
      title: "JSON/XML Export",
      description: "Export structured data for integration with other systems"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Encrypted Exports",
      description: "Automatically encrypt sensitive data during export process"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Access Controls",
      description: "Role-based permissions for export functionality"
    }
  ]

  const exportFormats = [
    {
      format: "PDF",
      useCase: "Clinical summaries, discharge papers, patient reports",
      icon: <FileText className="h-5 w-5" />
    },
    {
      format: "JSON",
      useCase: "System integration, API consumption, data migration",
      icon: <FileCode className="h-5 w-5" />
    },
    {
      format: "XML",
      useCase: "Legacy system compatibility, HL7/FHIR compliance",
      icon: <FileArchive className="h-5 w-5" />
    }
  ]

  const securityMetrics = [
    { metric: "AES-256", description: "Encryption standard" },
    { metric: "100%", description: "HIPAA compliant" },
    { metric: "<5s", description: "Export generation" },
    { metric: "0", description: "Manual steps required" }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-foreground rounded-lg">
                  <Download className="w-6 h-6 text-background" />
                </div>
                <span className="text-lg font-semibold text-muted-foreground">Secure Export</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Export Data{" "}
                <span className="text-foreground">Securely</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Generate patient records and clinical data in multiple formats with built-in security 
                and compliance controls. One-click exports that maintain data integrity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  <Play className="h-4 w-4" />
                  Try Export Demo
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/home/features/workflow-optimization">
                    Next: Workflow Optimization <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Card className="bg-muted/50 border-0 p-8">
                <CardContent className="p-0">
                  <div className="space-y-6">
                    <div className="bg-background p-6 rounded-lg border">
                      <div className="flex items-center gap-3 mb-4">
                        <Download className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold">Export Options</h3>
                      </div>
                      <div className="space-y-3">
                        {exportFormats.map((format, index) => (
                          <div key={index} className="flex items-center justify-between p-2">
                            <div className="flex items-center gap-3">
                              {format.icon}
                              <span className="font-medium">{format.format}</span>
                            </div>
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-background p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold">Security Status</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>All exports encrypted and HIPAA compliant</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section 
        className="py-20 bg-muted/30"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Export Capabilities
            </motion.h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {exportFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeUp}>
                <Card className="h-full border text-center">
                  <CardHeader>
                    <div className="mx-auto bg-foreground text-background p-2 rounded-lg w-fit">
                      {feature.icon}
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
        </div>
      </motion.section>

      <motion.section 
        className="py-20"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Security & Performance
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {securityMetrics.map((metric, index) => (
              <motion.div key={index} variants={fadeUp} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2 bg-background rounded-lg p-6 border">
                  {metric.metric}
                </div>
                <div className="text-sm text-muted-foreground">{metric.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="py-20"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-muted/50 border-0">
            <CardContent className="p-12 text-center">
              <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Export with Confidence?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
                Generate secure, compliant exports in seconds without compromising data integrity.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  View Export Demo
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <motion.section 
        className="py-20 border-t"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold mb-6">
              Explore More Features
            </motion.h2>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/home/features/real-time-editing">
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Real-time Editing
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/home/features/workflow-optimization">
                  Workflow Optimization <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/home/features/hl7-translation">
                  HL7 Translation <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  )
}