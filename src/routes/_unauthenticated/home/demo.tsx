import { createFileRoute } from '@tanstack/react-router'
import Demo from '@/features/home/demo'

export const Route = createFileRoute('/_unauthenticated/home/demo')({
  component: Demo,
})
