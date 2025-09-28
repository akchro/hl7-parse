"use client"

import { motion } from "framer-motion"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Heart,
  Zap,
  FileText,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  Linkedin,
  Twitter,
  Github,
  Mailbox
} from "lucide-react"

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t">
      {/* Newsletter Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="bg-muted/30 py-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold mb-4">
              Stay Updated with Prism
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mb-8">
              Subscribe for healthcare interoperability updates, feature releases, and industry insights.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                <Send className="h-4 w-4" />
                Subscribe
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Main Footer Content */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-foreground rounded-lg">
                <Heart className="w-5 h-5 text-background" />
              </div>
              <h3 className="text-lg font-semibold">Prism</h3>
            </div>
            <p className="text-muted-foreground">
              A clinician-friendly solution that transforms complex HL7 data streams into 
              digestible, editable, and exportable formats for healthcare professionals.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Mailbox, href: "#", label: "Email" }
              ].map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  asChild
                >
                  <Link to={social.href} aria-label={social.label}>
                    <social.icon className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="text-lg font-semibold">Core Features</h3>
            <ul className="space-y-2">
              {[
                { name: "HL7 Translation", href: "/home/features/hl7-translation" },
                { name: "Real-time Editing", href: "/home/features/real-time-editing" },
                { name: "Secure Export", href: "/home/features/secure-export" },
                { name: "Workflow Optimization", href: "/home/features/workflow-optimization" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Zap className="h-3 w-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2">
              {[
                { name: "Documentation", href: "/docs" },
                { name: "HL7 Standards Guide", href: "/hl7-guide" },
                { name: "Implementation Guide", href: "/implementation" },
                { name: "Support Center", href: "/support" },
                { name: "API Reference", href: "/api" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-3 w-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-foreground" />
                <span className="text-muted-foreground">Healthcare Innovation District</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-foreground" />
                <span className="text-muted-foreground">+1 (555) HL7-CARE</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-foreground" />
                <span className="text-muted-foreground">support@prism.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-foreground" />
                <span className="text-muted-foreground">24/7 Healthcare Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Footer */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="border-t py-6"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Prism. Making healthcare data accessible for clinicians.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              {[
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "HIPAA Compliance", href: "/hipaa" },
                { name: "Security", href: "/security" }
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  )
}