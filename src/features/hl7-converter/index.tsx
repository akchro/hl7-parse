import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';


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
}

export default function HL7Converter() {
  const [hl7Input, setHl7Input] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ json: boolean; xml: boolean }>({ json: false, xml: false });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveDescription, setSaveDescription] = useState('');

  const handleConvert = async () => {
    if (!hl7Input.trim()) {
      setError('Please enter an HL7 message');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
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
        setResult(data.data);
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

  const copyToClipboard = async (text: string, type: 'json' | 'xml') => {
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
PV1|1|I|ICU^101^01||||^DOCTOR^ATTENDING^^^MD||||||||||V123456789|||||||||||||||||||||||||202301011200|`;

  const loadSample = () => {
    setHl7Input(sampleHL7);
    setResult(null);
    setError(null);
  };

  return (
    
    <div className="container mx-auto p-6 max-w-7xl">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HL7 Message Converter</h1>
        <p className="text-muted-foreground">
          Convert HL7 messages to JSON and XML using Gemini AI
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
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex gap-2">
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
                  'Convert with Gemini AI'
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

        {/* Results Section */}
        <div className="space-y-6">
          {/* JSON Output */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>JSON Output</CardTitle>
                {result?.json && (
                  <div className="flex items-center gap-2">
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
              </div>
            </CardHeader>
            <CardContent>
              {result?.json ? (
                result.json.success ? (
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                    {JSON.stringify(result.json.content, null, 2)}
                  </pre>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {result.json.error || 'JSON conversion failed'}
                    </AlertDescription>
                  </Alert>
                )
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  JSON output will appear here after conversion
                </div>
              )}
            </CardContent>
          </Card>

          {/* XML Output */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>XML Output</CardTitle>
                {result?.xml && (
                  <div className="flex items-center gap-2">
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
              </div>
            </CardHeader>
            <CardContent>
              {result?.xml ? (
                result.xml.success ? (
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                    {result.xml.content}
                  </pre>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {result.xml.error || 'XML conversion failed'}
                    </AlertDescription>
                  </Alert>
                )
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  XML output will appear here after conversion
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Metadata Section */}
      {result && (result.json?.metadata || result.xml?.metadata) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Conversion Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {result.json?.metadata && (
                <div>
                  <h4 className="font-semibold mb-2">JSON Metadata</h4>
                  <pre className="bg-muted p-3 rounded text-sm">
                    {JSON.stringify(result.json.metadata, null, 2)}
                  </pre>
                </div>
              )}
              {result.xml?.metadata && (
                <div>
                  <h4 className="font-semibold mb-2">XML Metadata</h4>
                  <pre className="bg-muted p-3 rounded text-sm">
                    {JSON.stringify(result.xml.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Conversion Section */}
      {result && (result.json?.success || result.xml?.success) && (
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
    </div>
  );
}