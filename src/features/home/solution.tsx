'use client'

import { motion } from 'framer-motion'
import {
  Zap,
  Eye,
  Edit3,
  Download,
  RefreshCw,
  Shield,
  CheckCircle,
  ArrowRight,
  Workflow,
  Tablet,
  Users,
} from 'lucide-react'
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

export default function SolutionPage() {
  const coreFeatures = [
    {
      icon: <Workflow className='h-8 w-8' />,
      title: 'Seamless HL7 Ingestion',
      description:
        'Automatically processes ADT, ORU, and other HL7 v2 messages from your existing hospital systems.',
      benefit: 'No changes required to your current infrastructure',
    },
    {
      icon: <Tablet className='h-8 w-8' />,
      title: 'Intuitive Patient Dashboard',
      description:
        'Transforms complex HL7 data into a clean, visual interface that clinical staff can understand instantly.',
      benefit: 'Reduces training time from weeks to minutes',
    },
    {
      icon: <Edit3 className='h-8 w-8' />,
      title: 'Real-time Editing',
      description:
        'Update allergies, medications, and discharge notes directly without technical assistance.',
      benefit: 'Empowers clinical staff with direct control',
    },
    {
      icon: <Download className='h-8 w-8' />,
      title: 'Multi-format Export',
      description:
        'Generate updated HL7/FHIR messages or export to PDF, JSON, XML with one click.',
      benefit: 'Maintains interoperability while improving usability',
    },
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Connect',
      description:
        'HL7 LiteBoard integrates with your existing hospital systems and begins ingesting messages immediately.',
    },
    {
      step: '2',
      title: 'Translate',
      description:
        'Our system automatically converts technical HL7 data into human-readable patient information.',
    },
    {
      step: '3',
      title: 'Interact',
      description:
        'Clinical staff review and update patient data through an intuitive dashboard designed for healthcare workflows.',
    },
    {
      step: '4',
      title: 'Export',
      description:
        'Generate compliant HL7/FHIR messages or export in preferred formats for sharing and record-keeping.',
    },
  ]

  const keyBenefits = [
    {
      icon: <Zap className='h-6 w-6' />,
      title: 'Faster Patient Processing',
      description:
        'Reduce intake and discharge times by eliminating data interpretation delays',
    },
    {
      icon: <Users className='h-6 w-6' />,
      title: 'Clinician Empowerment',
      description:
        'Give healthcare staff direct control over patient data without IT dependency',
    },
    {
      icon: <Shield className='h-6 w-6' />,
      title: 'Full Compliance',
      description:
        'Maintain complete HL7/FHIR interoperability while simplifying the user experience',
    },
    {
      icon: <RefreshCw className='h-6 w-6' />,
      title: 'Seamless Integration',
      description:
        'Works with your existing systems—no expensive infrastructure changes required',
    },
  ]

  return (
    <div className='bg-background text-foreground flex min-h-screen flex-col'>
      <Navbar />

      {/* Hero Section */}
      <section className='relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className='mx-auto max-w-4xl text-center'
          >
            <div className='bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm'>
              <Zap className='h-4 w-4' />
              The HL7 LiteBoard Solution
            </div>
            <h1 className='mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl'>
              Healthcare Data, <span className='text-primary'>Humanized</span>
            </h1>
            <p className='text-muted-foreground mb-8 text-xl'>
              HL7 LiteBoard acts as a translation layer between complex
              technical standards and clinical workflows, giving healthcare
              professionals the simplicity they need without sacrificing
              interoperability.
            </p>
            <Button size='lg' className='gap-2'>
              See How It Works <ArrowRight className='h-4 w-4' />
            </Button>
          </motion.div>
        </div>
      </section>

      <main className='container mx-auto flex-1 px-4 py-12 sm:px-6 lg:px-8'>
        {/* Core Solution */}
        <motion.section
          className='py-16'
          initial='hidden'
          animate='visible'
          variants={fadeIn}
        >
          <div className='mb-12 text-center'>
            <h2 className='mb-6 text-3xl font-bold md:text-4xl'>
              One Platform,{' '}
              <span className='text-primary'>Four Transformations</span>
            </h2>
            <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
              HL7 LiteBoard simplifies healthcare data management through
              focused, powerful features
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className='h-full border transition-shadow hover:shadow-lg'>
                  <CardHeader>
                    <div className='mb-4 flex items-center gap-4'>
                      <div className='bg-primary/10 rounded-lg p-3'>
                        {feature.icon}
                      </div>
                      <CardTitle className='text-xl'>{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <p className='text-muted-foreground'>
                      {feature.description}
                    </p>
                    <div className='text-primary flex items-center gap-2 text-sm font-medium'>
                      <CheckCircle className='h-4 w-4' />
                      {feature.benefit}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          className='py-20'
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
        >
          <div className='mb-16 text-center'>
            <h2 className='mb-6 text-3xl font-bold md:text-4xl'>
              Simple <span className='text-primary'>Four-Step</span> Process
            </h2>
            <p className='text-muted-foreground text-xl'>
              From complex data to actionable insights in minutes
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
                className='text-center'
              >
                <Card className='bg-muted/50 h-full border-0'>
                  <CardHeader>
                    <div className='bg-primary text-primary-foreground mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold'>
                      {step.step}
                    </div>
                    <CardTitle className='text-lg'>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className='text-base'>
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Visual Demo */}
        <motion.section
          className='py-20'
          initial='hidden'
          animate='visible'
          variants={fadeIn}
        >
          <Card className='border-l-primary border-l-4'>
            <CardContent className='p-8 md:p-12'>
              <div className='grid items-center gap-12 md:grid-cols-2'>
                <div>
                  <h2 className='mb-6 text-2xl font-bold md:text-3xl'>
                    From Technical to{' '}
                    <span className='text-primary'>Tangible</span>
                  </h2>
                  <p className='text-muted-foreground mb-6 text-lg'>
                    HL7 LiteBoard transforms pipe-delimited messages into clean,
                    organized patient records that clinical staff can actually
                    use and understand.
                  </p>
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <Eye className='text-primary h-5 w-5' />
                      <span>
                        View patient data in familiar, intuitive layouts
                      </span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Edit3 className='text-primary h-5 w-5' />
                      <span>
                        Make real-time updates to critical information
                      </span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Shield className='text-primary h-5 w-5' />
                      <span>Maintain full data integrity and compliance</span>
                    </div>
                  </div>
                </div>
                <div className='bg-muted/30 flex aspect-video items-center justify-center rounded-lg p-8'>
                  <div className='text-center'>
                    <div className='bg-primary/10 mb-4 flex h-48 w-full items-center justify-center rounded-lg'>
                      <Tablet className='text-primary h-16 w-16' />
                    </div>
                    <p className='text-muted-foreground text-sm'>
                      Interactive dashboard preview - Clean, clinician-friendly
                      interface
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Key Benefits */}
        <motion.section
          className='py-20'
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
        >
          <div className='mb-16 text-center'>
            <h2 className='mb-6 text-3xl font-bold md:text-4xl'>
              Immediate <span className='text-primary'>Benefits</span>
            </h2>
            <p className='text-muted-foreground text-xl'>
              What healthcare organizations gain with HL7 LiteBoard
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {keyBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
                className='text-center'
              >
                <Card className='bg-background hover:bg-muted/50 h-full border-0 transition-colors'>
                  <CardHeader>
                    <div className='mb-4 flex justify-center'>
                      <div className='bg-primary/10 rounded-full p-3'>
                        {benefit.icon}
                      </div>
                    </div>
                    <CardTitle className='text-lg'>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className='py-20 text-center'
          initial='hidden'
          animate='visible'
          variants={fadeIn}
        ></motion.section>
      </main>

      <Footer />
    </div>
  )
}
