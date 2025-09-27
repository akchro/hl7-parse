"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link, Mail, Building, User, Briefcase, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

interface Connection {
  id: string
  name: string
  position: string
  company: string
  isCurrentEmployee: boolean
  connectionStrength: "strong" | "medium" | "weak"
  lastContact: string
  linkedInUrl: string
}

interface ReconnectProps {
  companyName?: string
  onSendMessage: (connections: Connection[]) => void
  onFindMore: () => void
}

export default function Reconnect({ companyName = "Target Company", onSendMessage, onFindMore }: ReconnectProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConnections, setSelectedConnections] = useState<Set<string>>(new Set())

  // Sample data - this will be replaced with actual scraped data
  const connections: Connection[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      position: "Senior Software Engineer",
      company: companyName,
      isCurrentEmployee: true,
      connectionStrength: "strong",
      lastContact: "3 months ago",
      linkedInUrl: "#"
    },
    {
      id: "2",
      name: "Michael Chen",
      position: "Engineering Manager",
      company: companyName,
      isCurrentEmployee: true,
      connectionStrength: "medium",
      lastContact: "6 months ago",
      linkedInUrl: "#"
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      position: "Product Director",
      company: companyName,
      isCurrentEmployee: true,
      connectionStrength: "weak",
      lastContact: "1 year ago",
      linkedInUrl: "#"
    },
    {
      id: "4",
      name: "David Kim",
      position: "Technical Recruiter",
      company: companyName,
      isCurrentEmployee: true,
      connectionStrength: "medium",
      lastContact: "2 months ago",
      linkedInUrl: "#"
    },
    {
      id: "5",
      name: "Lisa Thompson",
      position: "Former HR Manager",
      company: companyName,
      isCurrentEmployee: false,
      connectionStrength: "strong",
      lastContact: "8 months ago",
      linkedInUrl: "#"
    }
  ]

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Update parent component whenever selection changes
  useEffect(() => {
    const selected = connections.filter(conn => selectedConnections.has(conn.id))
    onSendMessage(selected)
  }, [selectedConnections, onSendMessage])

  const handleConnectionSelect = (connectionId: string, checked: boolean) => {
    const newSelected = new Set(selectedConnections)
    if (checked) {
      newSelected.add(connectionId)
    } else {
      newSelected.delete(connectionId)
    }
    setSelectedConnections(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedConnections.size === filteredConnections.length) {
      // Deselect all
      setSelectedConnections(new Set())
    } else {
      // Select all filtered connections
      setSelectedConnections(new Set(filteredConnections.map(conn => conn.id)))
    }
  }

  const handleMessageSelected = () => {
    const selected = connections.filter(conn => selectedConnections.has(conn.id))
    selected.forEach(connection => {
      console.log('Sending message to:', connection.name)
    })
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong": return "bg-green-100 text-green-800 hover:bg-green-100"
      case "medium": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "weak": return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case "strong": return "Strong"
      case "medium": return "Medium"
      case "weak": return "Weak"
      default: return "Unknown"
    }
  }

  const isAllSelected = selectedConnections.size === filteredConnections.length && filteredConnections.length > 0
  const isIndeterminate = selectedConnections.size > 0 && selectedConnections.size < filteredConnections.length

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center mb-8"
      >
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Link className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Professional Connections</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We found {connections.length} connections at {companyName}. Select multiple contacts to reach out for referrals and insights.
        </p>
        {selectedConnections.size > 0 && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg inline-block">
            <p className="text-sm font-medium text-primary">
              {selectedConnections.size} connection{selectedConnections.size !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </motion.div>

      {/* Search and Actions */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search connections by name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onFindMore}>
            <Sparkles className="h-4 w-4 mr-2" />
            Find More Connections
          </Button>
          <Button 
            onClick={handleMessageSelected}
            disabled={selectedConnections.size === 0}
          >
            <Mail className="h-4 w-4 mr-2" />
            Message Selected ({selectedConnections.size})
          </Button>
        </div>
      </motion.div>

      {/* Connections Table */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connections at {companyName}</CardTitle>
                <CardDescription>
                  {filteredConnections.length} connections found • {connections.filter(c => c.isCurrentEmployee).length} current employees
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isIndeterminate ? "data-[state=checked]:bg-primary/50" : ""}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connection</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConnections.map((connection) => (
                  <TableRow 
                    key={connection.id}
                    className={selectedConnections.has(connection.id) ? "bg-primary/5" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        id={`connection-${connection.id}`}
                        checked={selectedConnections.has(connection.id)}
                        onCheckedChange={(checked) => 
                          handleConnectionSelect(connection.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{connection.name}</div>
                          <div className="text-sm text-muted-foreground">{connection.company}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        {connection.position}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={connection.isCurrentEmployee ? "default" : "secondary"}>
                        <Building className="h-3 w-3 mr-1" />
                        {connection.isCurrentEmployee ? "Current" : "Former"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStrengthColor(connection.connectionStrength)}>
                        {getStrengthText(connection.connectionStrength)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {connection.lastContact}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConnectionSelect(connection.id, !selectedConnections.has(connection.id))}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          {selectedConnections.has(connection.id) ? 'Remove' : 'Select'}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={connection.linkedInUrl} target="_blank" rel="noopener noreferrer">
                            <Link className="h-4 w-4 mr-1" />
                            Profile
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredConnections.length === 0 && (
              <div className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No connections found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or finding more connections.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Connections Summary */}
      {selectedConnections.size > 0 && (
        <motion.div variants={fadeUp} className="bg-primary/5 p-6 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Selected Connections ({selectedConnections.size})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connections
              .filter(conn => selectedConnections.has(conn.id))
              .map(connection => (
                <div key={connection.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{connection.name}</p>
                      <p className="text-xs text-muted-foreground">{connection.position}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConnectionSelect(connection.id, false)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            }
          </div>
        </motion.div>
      )}

      {/* Stats Summary */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">{connections.length}</div>
              <div className="text-sm text-muted-foreground">Total Connections</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {connections.filter(c => c.isCurrentEmployee).length}
              </div>
              <div className="text-sm text-muted-foreground">Current Employees</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {connections.filter(c => c.connectionStrength === "strong").length}
              </div>
              <div className="text-sm text-muted-foreground">Strong Connections</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Section */}
      <motion.div variants={fadeUp} className="bg-muted/30 p-6 rounded-lg">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Connection Tips
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• <strong>Strong connections</strong> are more likely to respond and provide referrals</li>
          <li>• <strong>Current employees</strong> can give you the most up-to-date information</li>
          <li>• <strong>Select multiple contacts</strong> to increase your chances of getting responses</li>
          <li>• Personalize your message by mentioning how you know each other</li>
          <li>• Be clear about what you're asking for (referral, information, advice)</li>
        </ul>
      </motion.div>
    </div>
  )
}