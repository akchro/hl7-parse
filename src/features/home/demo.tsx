'use client'

import { motion } from 'framer-motion'
import { Play, ArrowRight, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/home-bar'

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

export default function DemoPage() {
  // Placeholder YouTube video ID - this would be replaced with your actual video ID
  const youtubeVideoId = 'dQw4w9WgXcQ' // Example placeholder ID

  const demoHighlights = [
    {
      title: 'HL7 Message Processing',
      description:
        'See how we transform complex HL7 v2 messages into clean, readable patient data',
    },
    {
      title: 'Real-time Dashboard',
      description:
        'Watch clinical staff interact with patient information in real-time',
    },
    {
      title: 'Export Functionality',
      description: 'See one-click export to PDF, JSON, and XML formats',
    },
    {
      title: 'Edit Workflows',
      description:
        'Demonstration of updating allergies, medications, and discharge notes',
    },
  ]

  return (
    <div className='bg-background text-foreground flex min-h-screen flex-col'>
      <Navbar />

      {/* Hero Section */}
      <section className='relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-0'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className='mx-auto max-w-4xl text-center'
          >
            <div className='bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm'>
              <Play className='h-4 w-4' />
              Live Demo
            </div>
            <h1 className='mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl'>
              See Prism <span className='text-primary'>in Action</span>
            </h1>
            <p className='text-muted-foreground mb-8 text-xl'>
              Watch how we transform complex healthcare data into intuitive,
              clinician-friendly workflows
            </p>
          </motion.div>
        </div>
      </section>

      <main className='container mx-auto flex-1 px-4 py-12 sm:px-6 lg:px-8'>
        {/* Video Player Section */}
        <motion.section
          className='py-16'
          initial='hidden'
          animate='visible'
          variants={fadeIn}
        >
          <div className='mx-auto max-w-4xl'>
            <Card className='bg-background border-0'>
              <CardHeader className='pb-8 text-center'>
                <CardTitle className='text-2xl md:text-3xl'>
                  Prism Platform Demo
                </CardTitle>
                <CardDescription className='text-lg'>
                  A comprehensive walkthrough of our solution
                </CardDescription>
              </CardHeader>
              <CardContent className='p-0'>
                {/* YouTube Video Embed */}
                <div className='aspect-video overflow-hidden rounded-lg bg-black'>
                  <div className='flex h-full w-full items-center justify-center'>
                    <div className='text-center'>
                      <div className='bg-primary/20 mb-4 inline-flex rounded-full p-8'>
                        <Play className='text-primary fill-primary h-16 w-16' />
                      </div>
                      <p className='text-lg text-white'>
                        Video Demo Coming Soon
                      </p>
                      <p className='mt-2 text-sm text-white/70'>
                        Placeholder for YouTube video demonstration
                      </p>
                    </div>

                    {/* Actual YouTube embed would be: */}
                    {/* <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                      title="Prism Demo"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe> */}
                  </div>
                </div>

                {/* Video Info Bar */}
                <div className='border-t p-6'>
                  <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                    <div>
                      <h3 className='font-semibold'>
                       Prism Platform Overview
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        Duration: 8:24 • Updated: November 2024
                      </p>
                    </div>
                    <Button className='gap-2'>
                      <Play className='h-4 w-4' />
                      Watch Full Demo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  )
}
