import { createFileRoute } from '@tanstack/react-router'
import Solution from '@/features/home/solution'

export const Route = createFileRoute('/_unauthenticated/home/solution')({
  component: Solution,
})
