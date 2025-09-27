import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_unauthenticated/home/features/translation',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_unauthenticated/home/features/translation"!</div>
}
