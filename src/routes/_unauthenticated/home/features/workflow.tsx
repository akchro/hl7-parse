import { createFileRoute } from '@tanstack/react-router'
import Workflow from '@/features/home/workflow'

export const Route = createFileRoute('/_unauthenticated/home/features/workflow')({
  component: Workflow,
})
