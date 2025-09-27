import { createFileRoute } from '@tanstack/react-router'
import Conversion from '@/features/dashboard/workflow/conversion'

export const Route = createFileRoute('/_authenticated/workflow/')({
  component: Conversion,
})

