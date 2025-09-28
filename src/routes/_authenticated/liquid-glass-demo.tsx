import { createFileRoute } from '@tanstack/react-router'
import { LiquidGlassDemo } from '@/components/liquid-glass-demo'

export const Route = createFileRoute('/_authenticated/liquid-glass-demo')({
  component: LiquidGlassDemo,
})