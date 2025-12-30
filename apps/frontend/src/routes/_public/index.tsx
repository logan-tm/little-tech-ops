import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      <p>Welcome to the public index page!</p>
    </div>
  )
}
