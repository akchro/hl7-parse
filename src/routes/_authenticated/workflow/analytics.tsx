import { createFileRoute } from '@tanstack/react-router'
import { Analytics } from '@/features/workflow/analytics'

export const Route = createFileRoute('/_authenticated/workflow/analytics')({
  component: Analytics,
})

