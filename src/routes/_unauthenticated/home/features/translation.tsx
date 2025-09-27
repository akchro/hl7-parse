import { createFileRoute } from '@tanstack/react-router'
import Translate from '@/features/home/translation'

export const Route = createFileRoute('/_unauthenticated/home/features/translation')({
  component: Translate,
})
