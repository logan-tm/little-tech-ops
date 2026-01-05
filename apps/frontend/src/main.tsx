import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import './styles.css'

import { createRouter } from './router.tsx'

const router = createRouter()

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 60 * 1000,
//     },
//   },
// })

// // Create a new router instance
// const router = createRouter({
//   routeTree,
//   context: { auth: undefined!, queryClient },
//   defaultPreload: 'intent',
//   scrollRestoration: true,
//   defaultStructuralSharing: true,
//   defaultPreloadStaleTime: 0,
// })

// // Register the router instance for type safety
// declare module '@tanstack/react-router' {
//   interface Register {
//     router: typeof router
//   }
// }

// function InnerApp() {
//   const auth = useAuth()
//   return <RouterProvider router={router} context={{ auth }} />
// }

// function App() {
//   const [trpcClient] = useState(() =>
//     trpc.createClient({
//       links: [
//         httpBatchLink({
//           url: 'http://localhost:4000/trpc',
//         }),
//       ],
//     }),
//   )

//   return (
//     <trpc.Provider client={trpcClient} queryClient={queryClient}>
//       <QueryClientProvider client={queryClient}>
//         <AuthProvider>
//           <InnerApp />
//         </AuthProvider>
//       </QueryClientProvider>
//     </trpc.Provider>
//   )
// }

// const rootElement = document.getElementById('app')
// if (rootElement && !rootElement.innerHTML) {
//   const root = ReactDOM.createRoot(rootElement)
//   root.render(
//     <StrictMode>
//       <App />
//     </StrictMode>,
//   )
// }
