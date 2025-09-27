import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/workflow/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/workflow/analytics"!</div>
}
