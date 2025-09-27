import { createFileRoute } from '@tanstack/react-router'
import Export from '@/features/home/export'

export const Route = createFileRoute('/_unauthenticated/home/features/export')({
  component: Export,
})
