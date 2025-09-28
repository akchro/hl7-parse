import { createFileRoute } from '@tanstack/react-router'
import  { Patients } from '@/features/workflow/patients'

export const Route = createFileRoute('/_authenticated/workflow/')({
  component: Patients,
})

