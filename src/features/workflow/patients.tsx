import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Download, FileText, User, Calendar, Loader2, Copy, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SavedConversion {
  id: string;
  title?: string;
  description?: string;
  original_hl7_content: string;
  json_content?: Record<string, any>;
  xml_content?: string;
  conversion_metadata?: Record<string, any>;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

interface SavedConversionListResponse {
  conversions: SavedConversion[];
  total: number;
  page: number;
  per_page: number;
}

export function Patients() {
  const [conversions, setConversions] = useState<SavedConversion[]>([]);
  const [selectedConversion, setSelectedConversion] = useState<SavedConversion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Fetch saved conversions from the database
  useEffect(() => {
    fetchConversions();
  }, []);

  const fetchConversions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/conversions/list');
      
      if (response.ok) {
        const data: SavedConversionListResponse = await response.json();
        setConversions(data.conversions);
      }
    } catch (error) {
      console.error('Error fetching conversions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversionClick = (conversion: SavedConversion) => {
    setSelectedConversion(conversion);
    setIsDialogOpen(true);
  };

  const handleDownload = (conversion: SavedConversion, format: 'hl7' | 'json' | 'xml') => {
    let content = '';
    let filename = `conversion-${conversion.id}`;
    let mimeType = 'text/plain';

    switch (format) {
      case 'hl7':
        content = conversion.original_hl7_content;
        filename += '.hl7';
        break;
      case 'json':
        content = conversion.json_content ? JSON.stringify(conversion.json_content, null, 2) : '{}';
        filename += '.json';
        mimeType = 'application/json';
        break;
      case 'xml':
        content = conversion.xml_content || '';
        filename += '.xml';
        mimeType = 'application/xml';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getPatientInfoFromHL7 = (hl7Content: string) => {
    // Simple HL7 parsing to extract patient information
    const lines = hl7Content.split('\n');
    let patientName = 'Unknown Patient';
    let patientId = 'Unknown ID';

    for (const line of lines) {
      if (line.startsWith('PID')) {
        const segments = line.split('|');
        if (segments.length >= 6) {
          // PID|1||123456789^^^MRN^MR||DOE^JOHN^MIDDLE^^MR^
          const nameSegment = segments[5];
          const idSegment = segments[3];
          
          if (nameSegment && nameSegment !== '') {
            const nameParts = nameSegment.split('^');
            if (nameParts.length >= 2) {
              patientName = `${nameParts[0]} ${nameParts[1]}`.trim();
            }
          }
          
          if (idSegment && idSegment !== '') {
            const idParts = idSegment.split('^');
            if (idParts.length > 0) {
              patientId = idParts[0];
            }
          }
        }
        break;
      }
    }

    return { patientName, patientId };
  };

  const filteredConversions = conversions.filter(conversion => {
    const { patientName, patientId } = getPatientInfoFromHL7(conversion.original_hl7_content);
    
    return (
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversion.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversion.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading patient conversions...</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Patient Conversions</h1>
        <p className="text-muted-foreground">
          View and download saved HL7 conversions for patients
        </p>
      </motion.div>

      {/* Search Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Search Conversions</CardTitle>
            <CardDescription>
              Search by patient name, ID, or conversion title
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, ID, or conversion title..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Conversions Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Saved Patient Conversions</CardTitle>
            <CardDescription>
              {filteredConversions.length} conversion{filteredConversions.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Conversion Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Available Formats</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No conversions found</p>
                        <p className="text-sm">
                          {searchTerm ? 'Try adjusting your search terms' : 'Convert some HL7 messages to see them here'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConversions.map((conversion, index) => {
                      const { patientName, patientId } = getPatientInfoFromHL7(conversion.original_hl7_content);
                      
                      return (
                        <motion.tr
                          key={conversion.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleConversionClick(conversion)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{patientName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{patientId}</Badge>
                          </TableCell>
                          <TableCell>
                            {conversion.title || (
                              <span className="text-muted-foreground italic">Untitled</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {conversion.user_id || 'System'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(conversion.created_at), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                HL7
                              </Badge>
                              {conversion.json_content && (
                                <Badge variant="secondary" className="text-xs">
                                  JSON
                                </Badge>
                              )}
                              {conversion.xml_content && (
                                <Badge variant="secondary" className="text-xs">
                                  XML
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConversionClick(conversion);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Download Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Download Conversion</DialogTitle>
            <DialogDescription>
              Choose the format you want to download for this patient conversion
            </DialogDescription>
          </DialogHeader>
          
          {selectedConversion && (
            <div className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Patient Information</h4>
                  {(() => {
                    const { patientName, patientId } = getPatientInfoFromHL7(selectedConversion.original_hl7_content);
                    return (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{patientName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Patient ID:</span>
                          <p className="font-medium">{patientId}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Conversion Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Title:</span>
                      <p>{selectedConversion.title || 'Untitled'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p>{format(new Date(selectedConversion.created_at), 'PPpp')}</p>
                    </div>
                  </div>
                  {selectedConversion.description && (
                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p className="text-sm">{selectedConversion.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Available Formats</h4>
                  <div className="grid gap-3">
                    {/* HL7 Download */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Original HL7</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedConversion.original_hl7_content.length} characters
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyToClipboard(selectedConversion.original_hl7_content, 'hl7')}
                        >
                          {copiedType === 'hl7' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(selectedConversion, 'hl7')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>

                    {/* JSON Download */}
                    {selectedConversion.json_content && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">JSON Format</p>
                            <p className="text-sm text-muted-foreground">
                              Structured data format
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(JSON.stringify(selectedConversion.json_content, null, 2), 'json')}
                          >
                            {copiedType === 'json' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(selectedConversion, 'json')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* XML Download */}
                    {selectedConversion.xml_content && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium">XML Format</p>
                            <p className="text-sm text-muted-foreground">
                              Markup language format
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(selectedConversion.xml_content || '', 'xml')}
                          >
                            {copiedType === 'xml' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(selectedConversion, 'xml')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}