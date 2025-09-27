"use client"

import { motion } from "framer-motion"
import {
  TrendingUp,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Play,
  CheckCircle,
  BarChart,
  Target,
  RefreshCw
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

export default function WorkflowOptimizationPage() {
  const optimizationFeatures = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Streamlined Intake",
      description: "Reduce patient admission time with automated data processing"
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: "Automated Discharge",
      description: "Generate complete discharge packages with one click"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Workflow Analytics",
      description: "Track efficiency metrics and identify bottlenecks"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Task Automation",
      description: "Automate repetitive data entry and validation tasks"
    }
  ]

  const efficiencyMetrics = [
    { metric: "60%", description: "Faster patient intake" },
    { metric: "45%", description: "Reduced discharge time" },
    { metric: "80%", description: "Less manual entry" },
    { metric: "100%", description: "Staff satisfaction" }
  ]

  const workflowAreas = [
    {
      area: "Patient Admission",
      improvement: "Automated registration from HL7 ADT messages",
      icon: <Users className="h-5 w-5" />
    },
    {
      area: "Clinical Documentation",
      improvement: "Real-time updates and auto-populated fields",
      icon: <BarChart className="h-5 w-5" />
    },
    {
      area: "Discharge Process",
      improvement: "Instant report generation and data synchronization",
      icon: <RefreshCw className="h-5 w-5" />
    }
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
                  <TrendingUp className="w-6 h-6 text-background" />
                </div>
                <span className="text-lg font-semibold text-muted-foreground">Workflow Optimization</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Optimize Clinical{" "}
                <span className="text-foreground">Workflows</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Streamline healthcare operations with automated data processing, 
                reduced manual entry, and seamless integration across clinical workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  <Play className="h-4 w-4" />
                  View Workflow Demo
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/home/features">
                    Back to Features <ArrowRight className="h-4 w-4 ml-2" />
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
                        <TrendingUp className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold">Efficiency Gains</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Patient Intake</span>
                          <div className="flex items-center gap-2 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>60% faster</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Data Entry</span>
                          <div className="flex items-center gap-2 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>80% reduction</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Discharge Process</span>
                          <div className="flex items-center gap-2 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>45% faster</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-background p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold">Status</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>All workflows optimized and active</span>
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
              Optimization Features
            </motion.h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {optimizationFeatures.map((feature, index) => (
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
              Impact Metrics
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {efficiencyMetrics.map((metric, index) => (
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
        className="py-20 bg-muted/30"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-6">
              Optimized Workflow Areas
            </motion.h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {workflowAreas.map((area, index) => (
              <motion.div key={index} variants={fadeUp}>
                <Card className="h-full border-0 bg-background">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-foreground text-background p-2 rounded">
                        {area.icon}
                      </div>
                      <CardTitle className="text-xl">{area.area}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{area.improvement}</CardDescription>
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
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-muted/50 border-0">
            <CardContent className="p-12 text-center">
              <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Optimize Your Workflows?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
                Transform clinical operations with automated workflows and seamless data integration.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  View Workflow Demo
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
              Explore All Features
            </motion.h2>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/home/features/hl7-translation">
                  HL7 Translation
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/home/features/real-time-editing">
                  Real-time Editing
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/home/features/secure-export">
                  Secure Export
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