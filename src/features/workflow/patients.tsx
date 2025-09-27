import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronRight, FileText, User, Loader2 } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  patientId: string;
  dateOfBirth?: string;
  gender?: string;
  messageCount: number;
  lastMessageDate?: string;
}

interface HL7Message {
  message_id: string;
  patient_id: string;
  patient_name: string;
  message_type: string;
  timestamp: string;
  raw_content?: string;
  json_content?: any;
  xml_content?: string;
  status?: string;
}

export function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [messages, setMessages] = useState<HL7Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Using the browse messages endpoint to get patient data
      const response = await fetch('/api/browse/messages?group_by=patient');
      if (response.ok) {
        const data = await response.json();
        // Transform the API response to match our Patient interface
        const patientData = data.messages?.map((msg: any) => ({
          id: msg.patient_id,
          name: msg.patient_name || 'Unknown Patient',
          patientId: msg.patient_id,
          messageCount: msg.message_count || 0,
          lastMessageDate: msg.last_timestamp,
        })) || [];
        setPatients(patientData);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientMessages = async (patientId: string) => {
    try {
      setMessagesLoading(true);
      // Using search endpoint to get messages for specific patient
      const response = await fetch(`/api/browse/search?patient_id=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching patient messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handlePatientClick = (patientId: string) => {
    if (selectedPatient === patientId) {
      setSelectedPatient(null);
      setMessages([]);
    } else {
      setSelectedPatient(patientId);
      fetchPatientMessages(patientId);
    }
  };

  const handleMessageClick = (message: HL7Message) => {
    navigate({
      to: '/workflow/analytics',
      search: { 
        messageId: message.message_id,
        patientName: message.patient_name,
        format: 'raw' // Default to raw format
      }
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">
          Manage and view patient HL7 messages
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Patient Search</CardTitle>
            <CardDescription>
              Search for patients by name or patient ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {filteredPatients.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="text-center py-12"
          >
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No patients found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'No patients available'}
            </p>
          </motion.div>
        ) : (
          filteredPatients.map((patient) => (
            <motion.div
              key={patient.id}
              variants={itemVariants}
              layout
            >
              <Card className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {selectedPatient === patient.id ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <CardDescription>
                          Patient ID: {patient.patientId}
                          {patient.dateOfBirth && ` • DOB: ${patient.dateOfBirth}`}
                          {patient.gender && ` • Gender: ${patient.gender}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {patient.messageCount} message{patient.messageCount !== 1 ? 's' : ''}
                      </Badge>
                      {patient.lastMessageDate && (
                        <Badge variant="outline">
                          Last: {new Date(patient.lastMessageDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {selectedPatient === patient.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="border-t pt-4">
                        {messagesLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2">Loading messages...</span>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            No messages found for this patient
                          </div>
                        ) : (
                          <ScrollArea className="h-64">
                            <div className="space-y-2">
                              {messages.map((message) => (
                                <motion.div
                                  key={message.message_id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Card 
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleMessageClick(message)}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          <div>
                                            <p className="font-medium">
                                              {message.message_type || 'Unknown Message Type'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {new Date(message.timestamp).toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="outline">
                                            {message.message_id.slice(0, 8)}...
                                          </Badge>
                                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}