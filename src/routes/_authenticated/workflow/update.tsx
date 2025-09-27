import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/workflow/update')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/workflow/update"!</div>
}
