import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_unauthenticated/home/problem')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_unauthenticated/home/problem"!</div>
}
