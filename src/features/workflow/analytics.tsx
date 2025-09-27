import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, FileText, Code, Edit, Loader2 } from 'lucide-react';

interface AnalyticsSearch {
  messageId: string;
  patientName: string;
  format: 'raw' | 'json' | 'xml';
}

export function Analytics() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_authenticated/workflow/analytics' });
  const { messageId, patientName, format: initialFormat } = search as AnalyticsSearch;
  
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeFormat, setActiveFormat] = useState<'raw' | 'json' | 'xml'>(initialFormat || 'raw');
  const [editedContent, setEditedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (messageId) {
      fetchMessageData();
    }
  }, [messageId]);

  const fetchMessageData = async () => {
    try {
      setLoading(true);
      // Fetch message details and formats
      const [messageDetail, rawFormat, jsonFormat, xmlFormat] = await Promise.all([
        fetch(`/api/browse/messages/${messageId}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/formats/${messageId}/raw`).then(r => r.ok ? r.text() : null),
        fetch(`/api/formats/${messageId}/json`).then(r => r.ok ? r.json() : null),
        fetch(`/api/formats/${messageId}/xml`).then(r => r.ok ? r.text() : null),
      ]);

      setMessage({
        ...messageDetail,
        raw: rawFormat,
        json: jsonFormat,
        xml: xmlFormat
      });

      // Set initial content based on format
      setEditedContent(getFormatContent(initialFormat, rawFormat, jsonFormat, xmlFormat));
    } catch (error) {
      console.error('Error fetching message data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormatContent = (format: string, raw: string | null, json: any, xml: string | null): string => {
  switch (format) {
    case 'json':
      return json ? JSON.stringify(json, null, 2) : 'No JSON content available';
    case 'xml':
      return xml || 'No XML content available';
    case 'raw':
    default:
      return raw || 'No raw content available';
  }
};

  const handleFormatChange = (format: 'raw' | 'json' | 'xml') => {
    setActiveFormat(format);
    if (message) {
      setEditedContent(getFormatContent(format, message.raw, message.json, message.xml));
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert the edited content back to the appropriate format
      let convertedContent = editedContent;
      
      if (activeFormat === 'json') {
        // Validate JSON
        const parsedJson = JSON.parse(editedContent);
        // Use the conversion endpoint to convert JSON back to HL7
        const response = await fetch('/api/mastra/convert/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hl7_message: parsedJson })
        });
        
        if (response.ok) {
          const result = await response.json();
          convertedContent = result.hl7_raw || editedContent;
        }
      }

      // Save the updated message
      const saveResponse = await fetch('/api/conversions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          content: convertedContent,
          format: activeFormat,
          patient_name: patientName
        })
      });

      if (saveResponse.ok) {
        // Refresh the message data
        await fetchMessageData();
        setIsEditing(false);
        
        // Navigate back to patients
        navigate({ to: '/workflow' });
      }
    } catch (error) {
      console.error('Error saving message:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset to original content when canceling edit
      setEditedContent(getFormatContent(activeFormat, message.raw, message.json, message.xml));
    }
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading message data...</p>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Message not found</p>
            <Button onClick={() => navigate({ to: '/workflow' })} className="mt-4">
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ to: '/workflow' })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Analytics</h1>
          <p className="text-muted-foreground">
            Patient: {patientName} • Message ID: {messageId}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>HL7 Message Content</CardTitle>
                <CardDescription>
                  View and edit the HL7 message in different formats
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={handleEditToggle}
                  disabled={saving}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                {isEditing && (
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeFormat} onValueChange={(value) => handleFormatChange(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="raw">
                  <FileText className="h-4 w-4 mr-2" />
                  Raw HL7
                </TabsTrigger>
                <TabsTrigger value="json">
                  <Code className="h-4 w-4 mr-2" />
                  JSON
                </TabsTrigger>
                <TabsTrigger value="xml">
                  <Code className="h-4 w-4 mr-2" />
                  XML
                </TabsTrigger>
              </TabsList>

              <TabsContent value="raw" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Raw HL7 Format</Badge>
                  {!isEditing && (
                    <Badge variant="outline">
                      {message.raw?.split('\n').length || 0} lines
                    </Badge>
                  )}
                </div>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  readOnly={!isEditing}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="Raw HL7 content will appear here..."
                />
              </TabsContent>

              <TabsContent value="json" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">JSON Format</Badge>
                  {!isEditing && (
                    <Badge variant="outline">
                      {message.json ? Object.keys(message.json).length : 0} properties
                    </Badge>
                  )}
                </div>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  readOnly={!isEditing}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="JSON content will appear here..."
                />
              </TabsContent>

              <TabsContent value="xml" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">XML Format</Badge>
                  {!isEditing && (
                    <Badge variant="outline">
                      {message.xml?.split('>').length || 0} elements
                    </Badge>
                  )}
                </div>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  readOnly={!isEditing}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="XML content will appear here..."
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}