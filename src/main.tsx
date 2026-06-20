import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createHashRouter, Navigate } from 'react-router-dom'
import './styles/global.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import ChapterPage from './pages/ChapterPage'
import { LangProvider } from './i18n/lang'
import { chapters } from './content/chapters'

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'learn/:slug', element: <ChapterPage /> },
      {
        path: 'learn',
        element: <Navigate to={`/learn/${chapters[0].slug}`} replace />,
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider>
      <RouterProvider router={router} />
    </LangProvider>
  </React.StrictMode>,
)
