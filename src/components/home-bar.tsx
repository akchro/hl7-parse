"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Heart, Zap, Shield, FileText, Info, Play } from 'lucide-react'
import { ThemeSwitch } from './theme-switch'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@tanstack/react-router'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const featuresItems = [
    {
      title: "HL7 Translation",
      icon: <Zap className="w-5 h-5" />,
      description: "Convert complex HL7 messages into readable formats",
      route: "/home/features/translation"
    },
    {
      title: "Real-time Editing",
      icon: <FileText className="w-5 h-5" />,
      description: "Update patient records directly in the interface",
      route: "/home/features/edit"
    },
    {
      title: "Secure Export",
      icon: <Shield className="w-5 h-5" />,
      description: "Generate PDF, JSON, XML with one click",
      route: "/home/features/export"
    },
    {
      title: "Workflow Optimization",
      icon: <Heart className="w-5 h-5" />,
      description: "Reduce intake and discharge times significantly",
      route: "/home/features/workflow"
    }
  ]

  return (
    <Card className="fixed left-[35px] right-[35px] top-[35px] mx-auto rounded-xl border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo - Left Aligned */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <Link to="/" className="flex-shrink-0 font-bold text-xl text-blue-600">
            HL7 LiteBoard
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2 space-x-8">
          <Link 
            to="/" 
            className="text-foreground hover:text-foreground/80 transition-colors [&.active]:font-medium"
            activeProps={{ className: "font-medium" }}
          >
            Home
          </Link>
          

          <Link 
            to="/home/problem" 
            className="text-foreground hover:text-foreground/80 transition-colors [&.active]:font-medium"
            activeProps={{ className: "font-medium" }}
          >
            The Problem
          </Link>

          <Link 
            to="/home/solution" 
            className="text-foreground hover:text-foreground/80 transition-colors [&.active]:font-medium"
            activeProps={{ className: "font-medium" }}
          >
            Our Solution
          </Link>

          <Link 
            to="/home/demo" 
            className="text-foreground hover:text-foreground/80 transition-colors [&.active]:font-medium flex items-center gap-1"
            activeProps={{ className: "font-medium" }}
          >
            <Play className="w-4 h-4" />
            Live Demo
          </Link>

          {/* Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                Features <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-3 grid grid-cols-1 gap-2">
              {featuresItems.map((item) => (
                <DropdownMenuItem key={item.title} asChild>
                  <Link to={item.route} className="flex items-start gap-3 p-3 rounded-lg w-full">
                    <div className="text-blue-600 mt-0.5">{item.icon}</div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-foreground/70">{item.description}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
        </div>

        

        {/* Buttons - Right Aligned */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/sign-in">Clinician Login</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/sign-up">Get Started Free</Link>
            </Button>
          </div>
          <ThemeSwitch />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-t border-foreground/10 overflow-hidden"
          >
            <div className="px-4 py-2 space-y-3">
              <Link
                to="/"
                className="block py-3 text-foreground hover:text-foreground/80 transition-colors [&.active]:font-medium border-b border-foreground/5"
                onClick={() => setMobileMenuOpen(false)}
                activeProps={{ className: "font-medium" }}
              >
                Home
              </Link>

              <div className="py-3 border-b border-foreground/5">
                <p className="font-medium text-sm text-foreground/70 mb-2">Features</p>
                <div className="space-y-3 ml-2">
                  {featuresItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.route}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="text-blue-600">{item.icon}</div>
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-foreground/60">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/home/problem"
                className="block py-3 text-foreground hover:text-foreground/80 transition-colors [&.active]:font-medium border-b border-foreground/5"
                onClick={() => setMobileMenuOpen(false)}
                activeProps={{ className: "font-medium" }}
              >
                The Problem
              </Link>

              <Link
                to="/home/solution"
                className="block py-3 text-foreground hover:text-foreground/80 transition-colors [&.active]:font-medium border-b border-foreground/5"
                onClick={() => setMobileMenuOpen(false)}
                activeProps={{ className: "font-medium" }}
              >
                Our Solution
              </Link>

              <Link
                to="/home/demo"
                className="block py-3 text-foreground hover:text-foreground/80 transition-colors [&.active]:font-medium border-b border-foreground/5 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
                activeProps={{ className: "font-medium" }}
              >
                <Play className="w-4 h-4" />
                Live Demo
              </Link>

              <div className="flex flex-col gap-3 pt-4 border-t border-foreground/10">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    Clinician Login
                  </Link>
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    Get Started Free
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}