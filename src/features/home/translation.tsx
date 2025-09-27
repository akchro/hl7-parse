"use client"

import { motion } from "framer-motion"
import {
  Heart,
  Zap,
  Shield,
  FileText,
  ArrowRight,
  Play,
  Code,
  Eye,
  Download,
  CheckCircle,
  Clock,
  Users
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

export default function HL7TranslationPage() {
  const translationFeatures = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "HL7 v2 Message Parsing",
      description: "Automatically parse and decode complex HL7 v2.x messages including ADT, ORU, ORM, and SIU segments"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Human-Readable Display",
      description: "Transform technical HL7 syntax into clean, organized clinical data that clinicians can easily understand"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Segment Mapping",
      description: "Intelligently map HL7 segments (PID, PV1, OBR, OBX) to familiar patient record fields"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Conversion",
      description: "Instant translation of incoming HL7 messages with sub-second processing times"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Data Validation",
      description: "Validate HL7 message structure and data integrity while maintaining HIPAA compliance"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Multi-Format Output",
      description: "Convert HL7 messages to JSON, XML, or structured clinical formats for easy integration"
    }
  ]

  const messageTypes = [
    {
      type: "ADT (Admit, Discharge, Transfer)",
      description: "Patient registration and tracking messages",
      examples: ["A01 - Admit Patient", "A03 - Discharge Patient", "A04 - Register Patient"]
    },
    {
      type: "ORU (Observation Result)",
      description: "Laboratory results and clinical observations",
      examples: ["R01 - Unsolicited Observation", "Laboratory Results", "Vital Signs"]
    },
    {
      type: "ORM (Order Message)",
      description: "Patient orders and service requests",
      examples: ["O01 - Order Message", "Medication Orders", "Procedure Orders"]
    },
    {
      type: "SIU (Scheduling Information)",
      description: "Appointment and resource scheduling",
      examples: ["S12 - New Appointment", "S13 - Cancel Appointment", "S14 - Modify Appointment"]
    }
  ]

  const benefits = [
    { metric: "95%", description: "Reduction in HL7 interpretation time" },
    { metric: "100%", description: "Message format compatibility" },
    { metric: "<1s", description: "Average translation speed" },
    { metric: "0", description: "Technical expertise required" }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-foreground rounded-lg">
                  <Zap className="w-6 h-6 text-background" />
                </div>
                <span className="text-lg font-semibold text-muted-foreground">HL7 Translation</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                From Complex HL7 to{" "}
                <span className="text-foreground">Clinician-Friendly</span> Data
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Transform intricate HL7 v2 messages into clear, actionable clinical information. 
                Our translation engine automatically converts technical syntax into intuitive displays 
                that healthcare professionals can understand at a glance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  <Play className="h-4 w-4" />
                  See Translation Demo
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/home/features/real-time-editing">
                    Next: Real-time Editing <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <Card className="bg-muted/50 border-0 p-8">
                <CardContent className="p-0">
                  <div className="space-y-6">
                    <div className="bg-background p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-3">
                        <Code className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold">HL7 Input Example</h3>
                      </div>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {`MSH|^~\\&|HIS|HOSP|LAB|HOSP|202401201030||ADT^A01|MSG001|P|2.5
PID|1||12345||DOE^JOHN||19800101|M|||123 MAIN ST^^CITY^ST^12345
PV1|1|I|ICU^ room 101|||||||||||||||||||||||||||||||||202401200800`}
                      </pre>
                    </div>
                    
                    <div className="bg-background p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-3">
                        <Eye className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold">Translated Output</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div><strong>Patient:</strong> John Doe (MRN: 12345)</div>
                        <div><strong>Admission:</strong> January 20, 2024 08:00 AM</div>
                        <div><strong>Location:</strong> ICU - Room 101</div>
                        <div><strong>Message Type:</strong> ADT A01 - Admit Patient</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        className="py-20 bg-muted/30"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Advanced HL7 Translation Capabilities
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Our translation engine handles the full spectrum of HL7 v2.x messages, providing 
              accurate, real-time conversion that maintains data integrity while improving usability.
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {translationFeatures.map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-foreground text-background p-2 rounded-lg">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Message Types Section */}
      <motion.section 
        className="py-20"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Supported HL7 Message Types
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Comprehensive support for all major HL7 v2.x message types used in healthcare settings
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {messageTypes.map((messageType, index) => (
              <motion.div 
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full border-0 bg-background hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">{messageType.type}</CardTitle>
                    <CardDescription className="text-base">{messageType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {messageType.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-foreground" />
                          <span className="text-sm">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section 
        className="py-20 bg-muted/30"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Translation Performance
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2 bg-background rounded-lg p-6 border">
                  {benefit.metric}
                </div>
                <div className="text-sm text-muted-foreground mt-2">{benefit.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-muted/50 border-0">
            <CardContent className="p-12 text-center">
              <motion.h2 
                variants={fadeUp}
                className="text-2xl md:text-3xl font-bold mb-4"
              >
                Ready to Simplify HL7 Data?
              </motion.h2>
              <motion.p 
                variants={fadeUp}
                className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto"
              >
                Experience how HL7 LiteBoard can transform complex messages into actionable clinical information.
              </motion.p>
              <motion.div 
                variants={fadeUp}
                className="flex flex-wrap gap-4 justify-center"
              >
                <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  View Live Demo
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Navigation Section */}
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
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8">
              Discover how HL7 LiteBoard's complete suite of tools can transform your healthcare workflow.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/home/features/real-time-editing">
                  Real-time Editing <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/home/features/secure-export">
                  Secure Export <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/home/features/workflow-optimization">
                  Workflow Optimization <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer Component */}
      <Footer />
    </div>
  )
}