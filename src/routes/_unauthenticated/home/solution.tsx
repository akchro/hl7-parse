import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_unauthenticated/home/solution')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_unauthenticated/home/solution"!</div>
}
