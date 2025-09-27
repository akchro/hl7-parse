import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/workflow/return')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/workflow/return"!</div>
}
