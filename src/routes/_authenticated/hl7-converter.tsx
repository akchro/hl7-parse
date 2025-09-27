import { createFileRoute } from '@tanstack/react-router'
import HL7Converter from '@/features/hl7-converter'

export const Route = createFileRoute('/_authenticated/hl7-converter')({
  component: () => <HL7Converter />,
})