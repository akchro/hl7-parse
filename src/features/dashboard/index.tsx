import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Users,
  CheckCircle,
  Zap,
  ArrowRight,
  Plus,
  Database,
  FileCode,
  FileOutput,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

// Mock data for dashboard
const dashboardStats = {
  totalConversions: 156,
  successRate: 94.2,
  patientsProcessed: 89,
  dataFieldsExtracted: 2847,
  recentActivity: [
    { id: 1, type: 'ADT^A01', patient: 'John Doe', status: 'success', time: '2 min ago' },
    { id: 2, type: 'ORU^R01', patient: 'Jane Smith', status: 'success', time: '5 min ago' },
    { id: 3, type: 'ADT^A03', patient: 'Mike Johnson', status: 'success', time: '10 min ago' },
    { id: 4, type: 'SIU^S12', patient: 'Sarah Wilson', status: 'processing', time: '15 min ago' },
  ],
  messageTypes: [
    { type: 'ADT', count: 67, color: 'bg-blue-500' },
    { type: 'ORU', count: 45, color: 'bg-green-500' },
    { type: 'SIU', count: 23, color: 'bg-purple-500' },
    { type: 'ORM', count: 21, color: 'bg-orange-500' },
  ]
}

export default function HL7Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  const handleNewConversion = () => {
    // Navigate to conversion page
    window.location.href = '/workflow'
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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">HL7 LiteBoard</h1>
              <p className="text-muted-foreground">
                Streamline HL7 data processing for clinical workflows
              </p>
            </div>
            <Button onClick={handleNewConversion} className="gap-2">
              <Plus className="h-4 w-4" />
              New Conversion
            </Button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalConversions}</div>
                <p className="text-xs text-muted-foreground">
                  +24 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.4% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patients Processed</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.patientsProcessed}</div>
                <p className="text-xs text-muted-foreground">
                  +12 this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Fields</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats.dataFieldsExtracted.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Extracted and processed
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="overview" key="overview">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid gap-6 lg:grid-cols-2"
                  >
                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                          Common tasks and conversions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <Button variant="outline" className="justify-start gap-3 h-16">
                          <FileCode className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">ADT to JSON</div>
                            <div className="text-sm text-muted-foreground">
                              Admission/Discharge/Transfer
                            </div>
                          </div>
                        </Button>
                        
                        <Button variant="outline" className="justify-start gap-3 h-16">
                          <FileOutput className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">ORU to PDF</div>
                            <div className="text-sm text-muted-foreground">
                              Observation results report
                            </div>
                          </div>
                        </Button>
                        
                        <Button variant="outline" className="justify-start gap-3 h-16">
                          <Database className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">Batch Process</div>
                            <div className="text-sm text-muted-foreground">
                              Multiple HL7 messages
                            </div>
                          </div>
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Message Type Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Message Types</CardTitle>
                        <CardDescription>
                          Distribution of processed HL7 messages
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {dashboardStats.messageTypes.map((msgType) => (
                            <div key={msgType.type} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`h-3 w-3 rounded-full ${msgType.color}`} />
                                <span className="font-medium">{msgType.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {msgType.count} messages
                                </span>
                                <Badge variant="secondary">
                                  {((msgType.count / dashboardStats.totalConversions) * 100).toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="activity" key="activity">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                          Latest HL7 message conversions and processing
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {dashboardStats.recentActivity.map((activity) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-3 rounded-lg border"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${
                                  activity.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  <Zap className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="font-medium">{activity.type}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {activity.patient}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                                  {activity.status}
                                </Badge>
                                <div className="text-sm text-muted-foreground">
                                  {activity.time}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="analytics" key="analytics">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid gap-6 lg:grid-cols-2"
                  >
                    {/* Performance Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                        <CardDescription>
                          System performance and conversion statistics
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Average Processing Time</span>
                          <Badge variant="outline">2.3s</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Error Rate</span>
                          <Badge variant="outline">0.8%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Daily Volume</span>
                          <Badge variant="outline">45/day</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Export Statistics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Export Formats</CardTitle>
                        <CardDescription>
                          Most used export formats
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">JSON</span>
                          </div>
                          <Badge>68%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FileOutput className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">PDF</span>
                          </div>
                          <Badge variant="secondary">45%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">XML</span>
                          </div>
                          <Badge variant="outline">32%</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>

          {/* Bottom CTA Section */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Ready to convert HL7 messages?</h3>
                    <p className="text-muted-foreground">
                      Start processing patient data with our AI-powered conversion tools
                    </p>
                  </div>
                  <Button onClick={handleNewConversion} size="lg" className="gap-2">
                    Start New Conversion
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Main>
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