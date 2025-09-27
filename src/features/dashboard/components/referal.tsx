"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Copy, Check, Send, Sparkles, User, Building, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

interface ReferralProps {
  companyName?: string
  jobTitle?: string
  connectionName?: string
  onSendEmail: (email: string, connectionName: string) => void
  onRegenerate: () => void
}

export default function Referral({ 
  companyName = "Google", 
  jobTitle = "Senior Software Engineer",
  connectionName = "Sarah Johnson",
  onSendEmail, 
  onRegenerate 
}: ReferralProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("casual")
  const [customizedEmail, setCustomizedEmail] = useState("")

  // Sample AI-generated emails (these would come from Gemini API)
  const sampleEmails = {
    casual: `Hi ${connectionName},

I hope you're doing well! I noticed that ${companyName} is hiring for a ${jobTitle} position, and I was really excited to see this opportunity.

I've been working in software engineering for the past 5 years, with a focus on full-stack development and cloud architecture. Recently, I led a team that improved system performance by 40% through optimization, and I'm looking for new challenges where I can make a similar impact.

I know you're currently at ${companyName} and was wondering if you'd be open to sharing any insights about the company culture or the hiring process? I'd also be grateful if you'd consider referring me if you think I'd be a good fit.

Thanks so much for your time and consideration!

Best regards,
[Your Name]`,

    professional: `Dear ${connectionName},

I hope this message finds you well. I'm writing to express my interest in the ${jobTitle} position at ${companyName} and to respectfully request your consideration for a referral.

With over 5 years of experience in software engineering, I have developed expertise in full-stack development, cloud architecture, and team leadership. My recent accomplishments include leading the development of customer-facing applications serving 1M+ users and improving system performance by 40% through strategic optimization.

I've been following ${companyName}'s work in [specific area] and admire your approach to [specific aspect]. I believe my skills in JavaScript, React, Node.js, and cloud technologies align well with the requirements of this role.

Would you be willing to refer me for this position or provide any insights about the hiring process? I would be happy to share my resume and portfolio for your review.

Thank you for your time and consideration.

Sincerely,
[Your Name]`,

    concise: `Hi ${connectionName},

I'm reaching out about the ${jobTitle} role at ${companyName}. With 5+ years in software engineering and experience leading teams that delivered 40% performance improvements, I believe I could be a strong candidate.

Would you be open to referring me or sharing any advice about the application process?

Thanks,
[Your Name]`
  }

  const currentEmail = customizedEmail || sampleEmails[activeTab as keyof typeof sampleEmails]

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(currentEmail)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSendEmail = () => {
    onSendEmail(currentEmail, connectionName)
  }

  const handleCustomizeChange = (value: string) => {
    setCustomizedEmail(value)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center mb-8"
      >
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Referral Email Template</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-generated email tailored for {connectionName} at {companyName} for the {jobTitle} position
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Info */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle>Connection Details</CardTitle>
              <CardDescription>
                Information about your connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{connectionName}</p>
                  <p className="text-sm text-muted-foreground">Your Connection</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{companyName}</p>
                  <p className="text-sm text-muted-foreground">Company</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Badge variant="secondary" className="mb-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Optimized
                </Badge>
                <p className="text-sm text-muted-foreground">
                  This email is personalized based on your resume and the job requirements
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Content */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Email Template</CardTitle>
              <CardDescription>
                Choose a style or customize your message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="casual">Casual</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="concise">Concise</TabsTrigger>
                </TabsList>
                
                <TabsContent value="casual" className="space-y-4">
                  <Textarea
                    value={activeTab === "casual" ? currentEmail : sampleEmails.casual}
                    onChange={(e) => handleCustomizeChange(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </TabsContent>
                
                <TabsContent value="professional" className="space-y-4">
                  <Textarea
                    value={activeTab === "professional" ? currentEmail : sampleEmails.professional}
                    onChange={(e) => handleCustomizeChange(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </TabsContent>
                
                <TabsContent value="concise" className="space-y-4">
                  <Textarea
                    value={activeTab === "concise" ? currentEmail : sampleEmails.concise}
                    onChange={(e) => handleCustomizeChange(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCopyEmail} className="gap-2">
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {isCopied ? 'Copied!' : 'Copy Email'}
                </Button>
                
                <Button onClick={handleSendEmail} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Email
                </Button>
                
                <Button variant="outline" onClick={onRegenerate} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Regenerate
                </Button>
                
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Customize
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tips Section */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Email Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Personalize</strong> the greeting with your connection's name</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Mention</strong> how you know each other or previous interactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Highlight</strong> 1-2 key achievements relevant to the role</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Be specific</strong> about what you're asking for (referral, advice, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Keep it concise</strong> - respect your connection's time</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Send</strong> during business hours for better response rates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Follow up</strong> politely if you don't hear back in 5-7 days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Attach</strong> your optimized resume for easy reference</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Thank them</strong> regardless of their response</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Keep track</strong> of who you've contacted and when</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Metrics */}
      <motion.div variants={fadeUp} className="bg-primary/5 p-6 rounded-lg">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Optimization Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">92%</div>
            <div className="text-sm text-muted-foreground">Personalization Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">45%</div>
            <div className="text-sm text-muted-foreground">Higher Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">8</div>
            <div className="text-sm text-muted-foreground">Key Keywords Included</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}