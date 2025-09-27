"use client"

import { motion } from "framer-motion"
import {
  Heart,
  Zap,
  Shield,
  FileText,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  Play,
  Download,
  Edit,
  Eye
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
import { Footer } from "@/components/footer" // Import the Footer component

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
  const problemPoints = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Complexity of HL7",
      description: "HL7 v2 is highly technical and difficult for non-technical users to interpret"
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "Cost of Integration",
      description: "Hospitals spend significant resources on interface engines and consultants"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Workflow Inefficiencies",
      description: "Multiple handoffs result in delays, redundant data entry, and errors"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Accessibility Gap",
      description: "Non-technical staff cannot act on HL7 data without IT involvement"
    }
  ]

  const solutionFeatures = [
    {
      icon: <Download className="h-6 w-6" />,
      title: "HL7 Message Ingestion",
      description: "Ingests HL7 v2 messages (ADT for admissions, ORU for labs) seamlessly"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Intuitive Dashboard",
      description: "Transforms and displays patient information in a clean, readable format"
    },
    {
      icon: <Edit className="h-6 w-6" />,
      title: "Real-time Editing",
      description: "Enables real-time edits to key fields like allergies and medications"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Interoperability Maintenance",
      description: "Generates updated HL7/FHIR messages to maintain system compatibility"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "One-Click Export",
      description: "Provides export in PDF, JSON, or XML formats for easy sharing"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Clinician-Friendly",
      description: "Bridges the gap between technical standards and daily clinical needs"
    }
  ]

  const benefits = [
    { metric: "70%", description: "Reduction in intake and discharge times" },
    { metric: "60%", description: "Lower integration costs for healthcare systems" },
    { metric: "90%", description: "Improved data accuracy and accessibility" },
    { metric: "50%", description: "Reduced IT dependency for clinical staff" }
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
                  <Heart className="w-6 h-6 text-background" />
                </div>
                <span className="text-lg font-semibold text-muted-foreground">HL7 LiteBoard</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Simplifying{" "}
                <span className="text-foreground">Healthcare Data</span> for Clinicians
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                A lightweight, clinician-friendly solution that transforms complex HL7 data streams 
                into digestible, editable, and exportable formats—bridging the gap between technical 
                standards and daily clinical workflow needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  <Play className="h-4 w-4" />
                  Live Demo
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="bg-background p-4 rounded-lg border">
                        <FileText className="h-8 w-8 text-foreground mb-2" />
                        <h3 className="font-semibold">HL7 Input</h3>
                        <p className="text-sm text-muted-foreground">Raw messages</p>
                      </div>
                      <div className="bg-background p-4 rounded-lg border">
                        <Edit className="h-8 w-8 text-foreground mb-2" />
                        <h3 className="font-semibold">Edit & Update</h3>
                        <p className="text-sm text-muted-foreground">Real-time changes</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-background p-4 rounded-lg border">
                        <Eye className="h-8 w-8 text-foreground mb-2" />
                        <h3 className="font-semibold">Visual Dashboard</h3>
                        <p className="text-sm text-muted-foreground">Clean interface</p>
                      </div>
                      <div className="bg-background p-4 rounded-lg border">
                        <Download className="h-8 w-8 text-foreground mb-2" />
                        <h3 className="font-semibold">Export</h3>
                        <p className="text-sm text-muted-foreground">PDF, JSON, XML</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <motion.section 
        className="py-20 bg-muted/30"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              The Healthcare Data Challenge
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Current HL7 standards create significant barriers for healthcare professionals, 
              leading to inefficiencies and increased costs across the system.
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {problemPoints.map((point, index) => (
              <motion.div 
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 bg-background hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-foreground/10 p-2 rounded-lg">
                        {point.icon}
                      </div>
                      <CardTitle className="text-lg">{point.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{point.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Solution Section */}
      <motion.section 
        className="py-20"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Our Innovative Solution
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-xl max-w-3xl mx-auto">
              HL7 LiteBoard acts as a translation and interaction layer between hospital systems 
              and healthcare professionals, improving usability without requiring deep technical expertise.
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {solutionFeatures.map((feature, index) => (
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
              Measurable Impact
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
                Ready to Transform Your Healthcare Workflow?
              </motion.h2>
              <motion.p 
                variants={fadeUp}
                className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto"
              >
                Join healthcare providers who are already reducing costs and improving efficiency with HL7 LiteBoard.
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
                  Watch Demo
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Final Summary Section */}
      <motion.section 
        className="py-20 border-t"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold mb-6">
              Executive Summary
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-6">
              HL7 LiteBoard is a lightweight, clinician-friendly solution that ingests HL7 data streams 
              and presents them in a digestible, editable, and exportable format. By translating complex 
              HL7 v2 messages into a clean, interactive dashboard, the platform allows healthcare professionals 
              to quickly review, update, and generate patient records in familiar formats (PDF, JSON, XML).
            </motion.p>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
              The result is a tool that bridges the gap between highly technical HL7 standards and the daily 
              needs of clinical staff, reducing intake and discharge times while lowering integration costs 
              for healthcare systems.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Footer Component */}
      <Footer />
    </div>
  )
}