import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import Home from './components/home.jsx'
import Cours from './components/cours.jsx'
import Td from './components/td.jsx'
import Contact from './components/contact.jsx'
import Apropos from './components/a-propos.jsx'
import Login from './components/login.jsx'
import Dashboard from './components/dashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { ContextProvider } from './components/context.jsx'
import { NotificationProvider } from './components/NotificationContext.jsx'
import { initializeFiles } from './utils/initializeFiles.js'
import './App.css'

function App() {
  // Initialize files when app starts
  React.useEffect(() => {
    initializeFiles();
  }, []);

  return (
    <ContextProvider>
      <NotificationProvider>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path='/login' element={
                <ProtectedRoute requireLogin={false}>
                  <Login/>
                </ProtectedRoute>
              }/>
              <Route path="/dashboard" element={
                <ProtectedRoute requireAdmin={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/cours" element={
                <ProtectedRoute>
                  <Cours />
                </ProtectedRoute>
              } />
              <Route path="/cours/:year" element={
                <ProtectedRoute>
                  <Cours />
                </ProtectedRoute>
              } />
              <Route path="/td" element={
                <ProtectedRoute>
                  <Td />
                </ProtectedRoute>
              } />
              <Route path="/td/:year" element={
                <ProtectedRoute>
                  <Td />
                </ProtectedRoute>
              } />
              <Route path="/a-propos" element={
                <ProtectedRoute>
                  <Apropos/>
                </ProtectedRoute>
              } />
              <Route path="/contact" element={
                <ProtectedRoute>
                  <Contact/>
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </NotificationProvider>
    </ContextProvider>
  )
}

export default App
