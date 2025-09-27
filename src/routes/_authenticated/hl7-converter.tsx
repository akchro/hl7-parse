import { createFileRoute } from '@tanstack/react-router'
import HL7MedicalConverter from '@/features/hl7-converter/hl7-medical-converter'

export const Route = createFileRoute('/_authenticated/hl7-converter')({
  component: () => <HL7MedicalConverter />,
})