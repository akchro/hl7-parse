import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_unauthenticated/home/demo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_unauthenticated/home/demo"!</div>
}
