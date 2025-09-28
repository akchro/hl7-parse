import { createFileRoute } from '@tanstack/react-router'
import HL7Dashboard from '@/features/home/analytics'

export const Route = createFileRoute('/_authenticated/workflow/pdf')({
  component: HL7Dashboard,
})