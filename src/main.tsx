import { StrictMode, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function SimpleHL7Converter() {
  const [hl7Input, setHl7Input] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [xmlOutput, setXmlOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleConvert = async () => {
    if (!hl7Input.trim()) {
      setError('Please enter HL7 text before converting.')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)
    setJsonOutput('')
    setXmlOutput('')

    try {
      const response = await fetch('/api/v1/mastra/convert/both', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hl7_content: hl7Input
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.detail || 'Unknown error'}`)
      }

      if (data.success) {
        if (data.data.json?.success) {
          setJsonOutput(JSON.stringify(data.data.json.content, null, 2))
        } else {
          setJsonOutput(`Error: ${data.data.json?.error || 'JSON conversion failed'}`)
        }

        if (data.data.xml?.success) {
          setXmlOutput(data.data.xml.content)
        } else {
          setXmlOutput(`Error: ${data.data.xml?.error || 'XML conversion failed'}`)
        }

        setSuccess(true)
      } else {
        throw new Error(data.message || 'Conversion failed')
      }

    } catch (err) {
      console.error('Conversion error:', err)
      setError(`Conversion failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setJsonOutput('Error occurred during conversion')
      setXmlOutput('Error occurred during conversion')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSample = () => {
    const sampleHL7 = `MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20230101120000||ADT^A01^ADT_A01|123456789|P|2.5
EVN||202301011200|||^USER^USER^^^^^^USER
PID|1||123456789^^^MRN^MR||DOE^JOHN^MIDDLE^^MR^||19850315|M|||123 MAIN ST^^ANYTOWN^NY^12345^USA||(555)123-4567|||||123-45-6789|||||||||||||||
PV1|1|I|ICU^101^01||||^DOCTOR^ATTENDING^^^MD||||||||||V123456789|||||||||||||||||||||||||202301011200|`
    
    setHl7Input(sampleHL7)
    setJsonOutput('')
    setXmlOutput('')
    setError(null)
    setSuccess(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleSaveToDatabase = async () => {
    if (!hl7Input.trim() || (!jsonOutput || jsonOutput.startsWith('Error')) && (!xmlOutput || xmlOutput.startsWith('Error'))) {
      setError('Please convert the HL7 message successfully before saving.')
      return
    }

    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      // Parse the JSON output
      let parsedJson = null
      if (jsonOutput && !jsonOutput.startsWith('Error')) {
        try {
          parsedJson = JSON.parse(jsonOutput)
        } catch (e) {
          console.error('Failed to parse JSON for saving:', e)
        }
      }

      const response = await fetch('/api/v1/conversions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hl7_content: hl7Input,
          json_content: parsedJson,
          xml_content: xmlOutput && !xmlOutput.startsWith('Error') ? xmlOutput : null,
          title: `HL7 Conversion - ${new Date().toLocaleString()}`,
          description: 'Converted using Gemini AI'
        })
      })

      const data = await response.json()

      if (response.status === 409) {
        setError('This HL7 message has already been saved to the database.')
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.detail || 'Unknown error'}`)
      }

      if (data.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        throw new Error(data.message || 'Save failed')
      }

    } catch (err) {
      console.error('Save error:', err)
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Simple HL7 Converter</h1>
          <p className="text-muted-foreground">Convert HL7 messages to JSON and XML using Gemini AI</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="hl7Input" className="block text-sm font-medium text-foreground mb-2">
                HL7 Input
              </label>
              <textarea
                id="hl7Input"
                value={hl7Input}
                onChange={(e) => setHl7Input(e.target.value)}
                placeholder="Enter your HL7 message here..."
                className="w-full h-64 p-4 border border-border rounded-md bg-background text-foreground font-mono text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConvert}
                disabled={isLoading || !hl7Input.trim()}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                {isLoading ? 'Converting...' : 'Convert with Gemini AI'}
              </button>
              <button
                onClick={loadSample}
                className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-accent transition-colors"
              >
                Load Sample
              </button>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {success && !error && (
              <div className="p-4 bg-green-100 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">Conversion completed successfully!</p>
              </div>
            )}

            {saveSuccess && (
              <div className="p-4 bg-blue-100 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm">Successfully saved to database!</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="jsonOutput" className="block text-sm font-medium text-foreground">
                  JSON Output
                </label>
                {jsonOutput && !jsonOutput.startsWith('Error') && (
                  <button
                    onClick={() => copyToClipboard(jsonOutput)}
                    className="text-xs px-2 py-1 border border-border rounded text-muted-foreground hover:bg-accent transition-colors"
                  >
                    Copy
                  </button>
                )}
              </div>
              <textarea
                id="jsonOutput"
                value={jsonOutput}
                readOnly
                placeholder="JSON output will appear here..."
                className="w-full h-64 p-4 border border-border rounded-md bg-muted text-foreground font-mono text-sm resize-vertical"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="xmlOutput" className="block text-sm font-medium text-foreground">
                  XML Output
                </label>
                {xmlOutput && !xmlOutput.startsWith('Error') && (
                  <button
                    onClick={() => copyToClipboard(xmlOutput)}
                    className="text-xs px-2 py-1 border border-border rounded text-muted-foreground hover:bg-accent transition-colors"
                  >
                    Copy
                  </button>
                )}
              </div>
              <textarea
                id="xmlOutput"
                value={xmlOutput}
                readOnly
                placeholder="XML output will appear here..."
                className="w-full h-64 p-4 border border-border rounded-md bg-muted text-foreground font-mono text-sm resize-vertical"
              />
            </div>
          </div>
        </div>
        
        {/* Save to Database Button */}
        {jsonOutput && xmlOutput && (
          <div className="mt-6 text-center">
            <button
              onClick={handleSaveToDatabase}
              disabled={isSaving || (jsonOutput.startsWith('Error') && xmlOutput.startsWith('Error'))}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save to Database'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <SimpleHL7Converter />
    </StrictMode>
  )
}
