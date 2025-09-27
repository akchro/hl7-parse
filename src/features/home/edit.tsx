"use client"

import { motion } from "framer-motion"
import {
  Edit,
  Save,
  Undo,
  Users,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Zap,
  FileText,
  Lock
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

export default function RealTimeEditingPage() {
  const editingFeatures = [
    {
      icon: <Edit className="h-6 w-6" />,
      title: "Inline Field Editing",
      description: "Click any field to edit patient information directly in the interface with instant validation"
    },
    {
      icon: <Save className="h-6 w-6" />,
      title: "Auto-Save & Version Control",
      description: "Changes are automatically saved with complete audit trails and version history"
    },
    {
      icon: <Undo className="h-6 w-6" />,
      title: "Real-time Undo/Redo",
      description: "Instant undo/redo functionality for all edits with unlimited step history"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Role-based Permissions",
      description: "Granular access controls ensuring only authorized staff can modify specific data fields"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Live HL7 Regeneration",
      description: "Updated HL7 messages generated automatically as you edit, maintaining proper syntax"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "HIPAA-compliant Editing",
      description: "All edits are logged with user attribution and timestamp for compliance requirements"
    }
  ]

  const editableFields = [
    {
      category: "Patient Demographics",
      fields: ["Name", "Date of Birth", "Contact Information", "Emergency Contacts", "Insurance Details"],
      icon: <Users className="h-5 w-5" />
    },
    {
      category: "Clinical Information",
      fields: ["Allergies", "Medications", "Diagnoses", "Procedures", "Lab Results"],
      icon: <FileText className="h-5 w-5" />
    },
    {
      category: "Admission Details",
      fields: ["Admitting Physician", "Room/Bed Assignment", "Admission Date", "Discharge Planning"],
      icon: <Clock className="h-5 w-5" />
    },
    {
      category: "Clinical Notes",
      fields: ["Nursing Notes", "Physician Notes", "Discharge Instructions", "Progress Notes"],
      icon: <Edit className="h-5 w-5" />
    }
  ]

  const workflowBenefits = [
    { metric: "70%", description: "Faster data correction" },
    { metric: "100%", description: "Edit audit compliance" },
    { metric: "<2s", description: "HL7 regeneration time" },
    { metric: "0", description: "IT tickets for simple edits" }
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
                  <Edit className="w-6 h-6 text-background" />
                </div>
                <span className="text-lg font-semibold text-muted-foreground">Real-time Editing</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Edit HL7 Data in{" "}
                <span className="text-foreground">Real-Time</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Make instant corrections and updates to patient information directly within the translated HL7 data. 
                Our intuitive editing interface ensures accuracy while automatically maintaining HL7 compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  <Play className="h-4 w-4" />
                  Try Editing Demo
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/home/features/export">
                    Next: Secure Export <ArrowRight className="h-4 w-4 ml-2" />
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
                    <div className="bg-background p-6 rounded-lg border">
                      <div className="flex items-center gap-3 mb-4">
                        <Edit className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold">Live Editing Interface</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                          <span className="font-medium">Patient Name:</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-background rounded border">John Doe</span>
                            <Edit className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                          <span className="font-medium">Allergies:</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-background rounded border">Penicillin</span>
                            <Edit className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                          <span className="font-medium">Room Assignment:</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-background rounded border">ICU-101</span>
                            <Edit className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-background p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold">HL7 Regeneration Status</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>HL7 message updated and queued for transmission</span>
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
              Powerful Editing Capabilities
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Advanced editing features designed specifically for healthcare data integrity and workflow efficiency.
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {editingFeatures.map((feature, index) => (
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

      {/* Editable Fields Section */}
      <motion.section 
        className="py-20"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Comprehensive Field Editing
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Edit virtually any field from translated HL7 messages with appropriate validation and constraints
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {editableFields.map((category, index) => (
              <motion.div 
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full border-0 bg-background hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-foreground text-background p-2 rounded">
                        {category.icon}
                      </div>
                      <CardTitle className="text-xl">{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {category.fields.map((field, fieldIndex) => (
                        <li key={fieldIndex} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                          <CheckCircle className="h-4 w-4 text-foreground flex-shrink-0" />
                          <span className="text-sm">{field}</span>
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

      {/* Use Cases Section */}
      <motion.section 
        className="py-20"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Common Editing Scenarios
            </motion.h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <motion.div variants={fadeUp}>
              <Card className="text-center border-0 bg-background">
                <CardHeader>
                  <div className="mx-auto bg-blue-100 text-blue-600 p-3 rounded-full w-fit">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle>Patient Registration Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Correct misspelled names, update contact information, or fix demographic errors 
                    during patient intake without IT assistance
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ delay: 0.1 }}>
              <Card className="text-center border-0 bg-background">
                <CardHeader>
                  <div className="mx-auto bg-green-100 text-green-600 p-3 rounded-full w-fit">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle>Clinical Data Corrections</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Update allergy lists, medication records, or lab results in real-time as new 
                    information becomes available
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ delay: 0.2 }}>
              <Card className="text-center border-0 bg-background">
                <CardHeader>
                  <div className="mx-auto bg-purple-100 text-purple-600 p-3 rounded-full w-fit">
                    <Clock className="h-6 w-6" />
                  </div>
                  <CardTitle>Discharge Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Quickly update discharge instructions, follow-up appointments, and final 
                    diagnoses during patient discharge workflow
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
              Continue Exploring Features
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8">
              Discover how HL7 LiteBoard's complete suite of tools can transform your healthcare workflow.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/home/features/translation">
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  HL7 Translation
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/home/features/export">
                  Secure Export <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/home/features/workflow">
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