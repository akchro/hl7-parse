import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Users,
  ArrowRight,
  FileCode,
  Stethoscope,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Triage } from '@/components/triage'
import LiquidGlass from 'liquid-glass-react'

export default function HL7Dashboard() {
  const [triageOpen, setTriageOpen] = useState(false)

  const handleNewConversion = () => {
    window.location.href = '/hl7-converter'
  }

  const handleTriage = () => {
    setTriageOpen(true)
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

      {/* ===== Main Content ===== */}
      <Main>
        <div className="absolute inset-0 -z-30">
          <video
            src="bg2.mp4"
            autoPlay
            loop
            playsInline
            muted
            className="h-screen w-screen object-cover"
          />
          <div className="
    pointer-events-none absolute inset-0
    bg-[radial-gradient(ellipse_at_center,transparent_62%,white_100%)]
  " />
        </div>
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-bold tracking-tight">HL7 LiteBoard</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Streamline HL7 data processing for clinical workflows
            </p>
          </motion.div>

          {/* Main Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col lg:flex-row gap-6 w-full max-w-2xl"
          >
            {/* Conversion Button */}
            <LiquidGlass className="flex-1 cursor-pointer" onClick={handleNewConversion} cornerRadius={30} elasticity={0.05} displacementScale={25} blurAmount={0}
                         style={{position: 'relative', top:200, left:80}}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <FileCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">HL7 Conversion</h3>
                  <p className="text-muted-foreground">
                    Convert HL7 messages to JSON, XML, or PDF formats with AI-powered parsing
                  </p>
                </div>
                <Button 
                  onClick={handleNewConversion} 
                  className="w-full gap-2 group-hover:bg-blue-600 transition-colors"
                  size="lg"
                >
                  Start Conversion
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </LiquidGlass>

            {/* Triage Button */}
            <LiquidGlass className="flex-1 cursor-pointer group" onClick={handleTriage} cornerRadius={30} elasticity={0.05} displacementScale={25} blurAmount={0}
                         style={{position:"relative", top:200, right:80}}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                  <Stethoscope className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Patient Triage</h3>
                  <p className="text-muted-foreground">
                    Analyze patient data and prioritize cases using intelligent triage algorithms
                  </p>
                </div>
                <Button
                  onClick={handleTriage}
                  className="w-full gap-2 group-hover:bg-green-600 transition-colors"
                  size="lg"
                >
                  Access Triage
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </LiquidGlass>
          </motion.div>

          {/* Quick Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center text-sm text-muted-foreground"
          >
            Secure • Fast • HIPAA Compliant
          </motion.div>
        </div>
      </Main>

      {/* Triage Modal */}
      <Dialog open={triageOpen} onOpenChange={setTriageOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] h-[95vh] overflow-hidden flex flex-col sm:!max-w-[95vw]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Patient Triage System
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-1">
            <Triage className="w-full min-w-0" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

const topNav = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Conversions',
    href: '/conversions',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Patient Data',
    href: '/patients',
    isActive: false,
    disabled: false,
  },
  {
    title: 'HL7 Library',
    href: '/library',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    isActive: false,
    disabled: false,
  },
]