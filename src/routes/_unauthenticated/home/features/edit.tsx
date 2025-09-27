import { createFileRoute } from '@tanstack/react-router'
import Edit from '@/features/home/edit'

export const Route = createFileRoute('/_unauthenticated/home/features/edit')({
  component: Edit,
})
