import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Copy, CheckCircle, AlertCircle, Save, FileText, Download, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MedicalDocumentResult {
  plainEnglish?: string;
  html?: string;
  latex?: string;
  pdfBase64?: string;
  pdfFilename?: string;
  timestamp?: string;
}

interface ConversionResult {
  json?: {
    success: boolean;
    content: any;
    metadata?: any;
    error?: string;
  };
  xml?: {
    success: boolean;
    content: string;
    metadata?: any;
    error?: string;
  };
  medicalDocument?: MedicalDocumentResult;
}

export default function HL7MedicalConverter() {
  const [hl7Input, setHl7Input] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ json: boolean; xml: boolean; plain: boolean; latex: boolean }>({ 
    json: false, 
    xml: false, 
    plain: false, 
    latex: false 
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState('json');

  const handleConvert = async () => {
    if (!hl7Input.trim()) {
      setError('Please enter an HL7 message');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // First get JSON/XML conversion
      const response = await fetch('/api/v1/mastra/convert/both', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hl7_content: hl7Input,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Also get plain English conversion
        const plainEnglishResponse = await fetch('/api/v1/mastra/convert/plain-english', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hl7_content: hl7Input,
          }),
        });

        let medicalDoc: MedicalDocumentResult = {};
        if (plainEnglishResponse.ok) {
          const plainData = await plainEnglishResponse.json();
          if (plainData.success) {
            medicalDoc.plainEnglish = plainData.data.plainEnglish;
            medicalDoc.timestamp = plainData.data.timestamp;
          }
        }

        setResult({
          ...data.data,
          medicalDocument: medicalDoc
        });
        setActiveTab('json');
      } else {
        setError(data.message || 'Conversion failed');
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMedicalDocument = async () => {
    if (!hl7Input.trim()) {
      setError('Please enter an HL7 message');
      return;
    }

    setIsGeneratingPdf(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/mastra/convert/medical-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hl7_content: hl7Input,
          generatePdf: true,
          format: 'both'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(prev => ({
          ...prev,
          medicalDocument: data.data
        }));
        setActiveTab('medical');
      } else {
        setError(data.message || 'Failed to generate medical document');
      }
    } catch (err) {
      console.error('Medical document generation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'json' | 'xml' | 'plain' | 'latex') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadPdf = () => {
    if (result?.medicalDocument?.pdfBase64) {
      const byteCharacters = atob(result.medicalDocument.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.medicalDocument.pdfFilename || 'medical-document.pdf';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const viewPdf = () => {
    if (result?.medicalDocument?.pdfBase64) {
      try {
        const byteCharacters = atob(result.medicalDocument.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Try to open in new tab - this will use Chrome's default PDF viewer
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          // Clean up URL after the tab has loaded
          newWindow.onload = () => {
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          };
        } else {
          // Fallback to modal if popup blocked, but also use blob URL
          setPdfBlobUrl(url);
          setPdfDialogOpen(true);
          // Don't revoke URL yet as modal needs it
        }
      } catch (error) {
        console.error('Error opening PDF:', error);
        setError('Failed to open PDF. Please try downloading instead.');
      }
    }
  };

  const handleSaveConversion = async () => {
    if (!result || !hl7Input.trim()) {
      setError('No conversion data to save');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const saveData = {
        hl7_content: hl7Input,
        json_content: result.json?.success ? result.json.content : null,
        xml_content: result.xml?.success ? result.xml.content : null,
        plain_english: result.medicalDocument?.plainEnglish,
        latex_content: result.medicalDocument?.latex,
        html_content: result.medicalDocument?.html,
        pdf_base64: result.medicalDocument?.pdfBase64,
        conversion_metadata: {
          json_metadata: result.json?.metadata,
          xml_metadata: result.xml?.metadata,
          conversion_timestamp: new Date().toISOString()
        },
        title: saveTitle.trim() || undefined,
        description: saveDescription.trim() || undefined
      };

      const response = await fetch('/api/v1/conversions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (responseData.success) {
        setSaveSuccess(true);
        setSaveTitle('');
        setSaveDescription('');
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(responseData.message || 'Failed to save conversion');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const sampleHL7 = `MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20230101120000||ADT^A01^ADT_A01|123456789|P|2.5
EVN||202301011200|||^USER^USER^^^^^^USER
PID|1||123456789^^^MRN^MR||DOE^JOHN^MIDDLE^^MR^||19850315|M|||123 MAIN ST^^ANYTOWN^NY^12345^USA||(555)123-4567|||||123-45-6789|||||||||||||||
PV1|1|I|ICU^101^01||||^DOCTOR^ATTENDING^^^MD||||||||||V123456789|||||||||||||||||||||||||202301011200|
DG1|1||I10^E11.9^Type 2 diabetes mellitus without complications||20230101|F|||||||||||^DOCTOR^ATTENDING^^^MD
OBX|1|NM|2093-3^Cholesterol Total^LN||200|mg/dL|<200||||F|||20230101120000`;

  const loadSample = () => {
    setHl7Input(sampleHL7);
    setResult(null);
    setError(null);
  };

  // Cleanup blob URL when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (!pdfDialogOpen && pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl('');
    }
  }, [pdfDialogOpen, pdfBlobUrl]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HL7 Medical Document Converter</h1>
        <p className="text-muted-foreground">
          Convert HL7 messages to readable medical documents with PDF generation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>HL7 Input</CardTitle>
            <CardDescription>
              Paste your HL7 message below and click convert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your HL7 message here..."
              value={hl7Input}
              onChange={(e) => setHl7Input(e.target.value)}
              className="min-h-[350px] font-mono text-sm"
            />
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleConvert}
                disabled={isLoading || !hl7Input.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  'Convert to JSON/XML'
                )}
              </Button>
              <Button
                onClick={handleGenerateMedicalDocument}
                disabled={isGeneratingPdf || !hl7Input.trim()}
                variant="secondary"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Medical Doc
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={loadSample}>
                Load Sample
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Section with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="xml">XML</TabsTrigger>
                <TabsTrigger value="plain">Plain Text</TabsTrigger>
                <TabsTrigger value="latex">LaTeX</TabsTrigger>
                <TabsTrigger value="medical">Medical Doc</TabsTrigger>
              </TabsList>

              {/* JSON Tab */}
              <TabsContent value="json" className="mt-4">
                <div className="space-y-2">
                  {result?.json && (
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={result.json.success ? "default" : "destructive"}>
                        {result.json.success ? "Success" : "Failed"}
                      </Badge>
                      {result.json.success && result.json.content && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(result.json?.content, null, 2), 'json')}
                        >
                          {copied.json ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                  {result?.json?.success ? (
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                      {JSON.stringify(result.json.content, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      JSON output will appear here after conversion
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* XML Tab */}
              <TabsContent value="xml" className="mt-4">
                <div className="space-y-2">
                  {result?.xml && (
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={result.xml.success ? "default" : "destructive"}>
                        {result.xml.success ? "Success" : "Failed"}
                      </Badge>
                      {result.xml.success && result.xml.content && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.xml?.content || '', 'xml')}
                        >
                          {copied.xml ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                  {result?.xml?.success ? (
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                      {result.xml.content}
                    </pre>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      XML output will appear here after conversion
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Plain English Tab */}
              <TabsContent value="plain" className="mt-4">
                <div className="space-y-2">
                  {result?.medicalDocument?.plainEnglish && (
                    <div className="flex items-center justify-end mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result.medicalDocument?.plainEnglish || '', 'plain')}
                      >
                        {copied.plain ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                  {result?.medicalDocument?.plainEnglish ? (
                    <div className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] whitespace-pre-wrap">
                      {result.medicalDocument.plainEnglish}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      Plain English medical report will appear here
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* LaTeX Tab */}
              <TabsContent value="latex" className="mt-4">
                <div className="space-y-2">
                  {result?.medicalDocument?.latex && (
                    <div className="flex items-center justify-end mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result.medicalDocument?.latex || '', 'latex')}
                      >
                        {copied.latex ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                  {result?.medicalDocument?.latex ? (
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm font-mono">
                      {result.medicalDocument.latex}
                    </pre>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      LaTeX document will appear here after generation
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Medical Document Tab */}
              <TabsContent value="medical" className="mt-4">
                <div className="space-y-4">
                  {result?.medicalDocument?.pdfBase64 ? (
                    <>
                      <div className="flex gap-3 justify-center">
                        <Button 
                          onClick={viewPdf} 
                          variant="default" 
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3"
                        >
                          <Eye className="mr-2 h-5 w-5" />
                          View PDF
                        </Button>
                        <Button onClick={downloadPdf} variant="outline" size="lg" className="px-6 py-3">
                          <Download className="mr-2 h-5 w-5" />
                          Download PDF
                        </Button>
                      </div>
                      {result.medicalDocument.html && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Document Preview</h3>
                          <div className="bg-white border rounded-lg overflow-hidden">
                            <iframe
                              srcDoc={result.medicalDocument.html}
                              className="w-full h-96 border-0"
                              title="Medical Document Preview"
                              sandbox="allow-same-origin"
                              style={{
                                backgroundColor: 'white',
                                colorScheme: 'normal'
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground text-center">
                          PDF generated successfully! Use the buttons above to view or download the complete document.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      Click "Generate Medical Doc" to create a PDF document
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Save Conversion Section */}
      {result && (result.json?.success || result.xml?.success || result.medicalDocument?.plainEnglish) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Save Conversion</CardTitle>
            <CardDescription>
              Save this conversion to the database for future reference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="save-title" className="text-sm font-medium">
                  Title (optional)
                </label>
                <Input
                  id="save-title"
                  placeholder="e.g., Patient Admission - John Doe"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div>
                <label htmlFor="save-description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Input
                  id="save-description"
                  placeholder="e.g., ADT message for patient admission"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                onClick={handleSaveConversion}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Conversion
                  </>
                )}
              </Button>
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Saved successfully!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Viewer Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Medical Document Preview</DialogTitle>
          </DialogHeader>
          {pdfBlobUrl && (
            <iframe
              src={pdfBlobUrl}
              className="w-full h-full"
              title="PDF Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}