import { createFileRoute } from '@tanstack/react-router'
import PDF from '@/features/dashboard/workflow/pdf'

export const Route = createFileRoute('/_authenticated/workflow/pdf')({
  component: PDF,
})