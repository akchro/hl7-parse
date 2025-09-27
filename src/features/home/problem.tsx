"use client"

import { motion } from "framer-motion"
import {
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  Code,
  Brain,
  ArrowRight,
  BarChart3,
  MessageSquare
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

export default function ProblemPage() {
  const coreProblems = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Technical Complexity",
      description: "HL7 v2 messages are highly technical pipe-delimited formats that require specialized knowledge to interpret and work with.",
      impact: "Clinical staff cannot read or understand patient data without IT assistance",
      stats: "85% of clinical staff struggle with raw HL7 format"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Workflow Inefficiencies",
      description: "Patient intake and discharge processes involve multiple handoffs between technical and clinical staff.",
      impact: "Delays in patient care due to data interpretation bottlenecks",
      stats: "Average 45-minute delay in patient processing"
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "High Integration Costs",
      description: "Hospitals rely on expensive interface engines and consultants to manage HL7 data flows.",
      impact: "Significant financial burden on healthcare systems",
      stats: "$50K-$500K annually per hospital on HL7 integration"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Accessibility Gap",
      description: "Non-technical healthcare professionals cannot directly interact with or update HL7 data.",
      impact: "Creates dependency on IT departments for simple data updates",
      stats: "70% of data updates require IT intervention"
    }
  ]

  const realWorldScenarios = [
    {
      title: "Emergency Room Admissions",
      description: "During critical emergency situations, clinicians waste precious minutes waiting for IT to interpret HL7 admission data.",
      consequence: "Delayed patient care in time-sensitive scenarios"
    },
    {
      title: "Medication Updates",
      description: "When patient medication information changes, the update process involves multiple departments and manual data entry.",
      consequence: "Increased risk of medication errors and patient safety issues"
    },
    {
      title: "Discharge Planning",
      description: "Discharge summaries require coordination between clinical staff and IT to generate proper HL7 messages.",
      consequence: "Extended hospital stays and reduced bed availability"
    }
  ]

  const financialImpact = [
    { metric: "Integration Costs", value: "$500K", description: "Average annual HL7 integration expenses" },
    { metric: "Staff Time Lost", value: "15K hours", description: "Annual time spent on data interpretation" },
    { metric: "Patient Delays", value: "45 min", description: "Average delay per patient admission" },
    { metric: "Error Rates", value: "12%", description: "Data entry errors requiring rework" }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm text-muted-foreground mb-6">
              <AlertTriangle className="h-4 w-4" />
              The Healthcare Data Challenge
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              The Hidden Cost of{" "}
              <span className="text-primary">Healthcare Data Complexity</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              HL7 v2 is the backbone of healthcare interoperability, but its technical complexity 
              creates significant barriers that impact patient care, increase costs, and burden clinical staff.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {/* Problem Overview */}
        <motion.section 
          className="py-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">The HL7 Paradox</h2>
                  <p className="text-muted-foreground text-lg">
                    HL7 was designed to enable healthcare interoperability, but its complexity has created 
                    a new set of challenges. While machines communicate seamlessly, humans are left behind, 
                    struggling to interpret and work with the very data meant to improve patient care.
                  </p>
                </div>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Sample HL7 v2 Message</h3>
                      <p className="text-sm text-muted-foreground">Difficult for clinicians to read</p>
                    </div>
                  </div>
                  <code className="text-xs bg-background p-4 rounded block overflow-x-auto">
                    MSH|^~\\&|ADT1|MCM|LABADT|MCM|198808181126|SECURITY|ADT^A01|MSG00001|P|2.2|{"\n"}
                    EVN|A01|198808181123|||{"\n"}
                    PID|||PATID1234^5^M11||JONES^WILLIAM^A^III||19610615|M-||2106-3|1200 N ELM STREET^^GREENSBORO^NC^27401-1020|GL|(919)379-1212|(919)271-3434||S||PATID12345001^2^M10|123456789|987654^NC|{"\n"}
                    NK1|1|JONES^BARBARA^K|SPO|||||20011105|{"\n"}
                    PV1|1|I|2000^2012^01||||004777^ATTEND^AARON^A|||SUR||||ADM|A0|
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Core Problems Grid */}
        <motion.section
          className="py-20"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Four Critical Challenges in{" "}
              <span className="text-primary">Healthcare Data Management</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-xl max-w-3xl mx-auto">
              These challenges create a ripple effect that impacts patient care, staff efficiency, and hospital budgets
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {coreProblems.map((problem, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        {problem.icon}
                      </div>
                      <CardTitle className="text-xl">{problem.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {problem.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">Impact:</span> {problem.impact}
                      </div>
                      <div className="bg-muted/50 p-3 rounded text-sm">
                        <span className="font-semibold">Statistics:</span> {problem.stats}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Real World Impact */}
        <motion.section 
          className="py-20"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Real-World Impact on{" "}
              <span className="text-primary">Patient Care</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-xl max-w-3xl mx-auto">
              These scenarios demonstrate how technical data challenges directly affect clinical outcomes
            </motion.p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {realWorldScenarios.map((scenario, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full border border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary/10 text-primary rounded-full p-2">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {scenario.description}
                    </CardDescription>
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded border border-destructive/20">
                      <strong>Consequence:</strong> {scenario.consequence}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Financial Impact */}
        <motion.section 
          className="py-20"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-0">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  The <span className="text-primary">Financial Burden</span> of Data Complexity
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Healthcare systems face significant costs due to HL7 complexity and the required technical infrastructure
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {financialImpact.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                      {item.value}
                    </div>
                    <div className="font-semibold mb-1">{item.metric}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.description}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* The Solution Preview */}
        <motion.section 
          className="py-20 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="bg-muted/50 rounded-2xl p-12 max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-primary text-primary-foreground rounded-full p-4">
                <Brain className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              There's a Better Way to Manage Healthcare Data
            </h2>
            <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
              HL7 LiteBoard bridges the gap between technical standards and clinical needs, 
              transforming complex data into actionable information.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gap-2">
                Discover Our Solution <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                View Case Studies
              </Button>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  )
}