import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import Home from './components/home.jsx'
import Cours from './components/cours.jsx'
import Td from './components/td.jsx'
import AboutContact from './components/about-contact.jsx'
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
              <Route path="/" element={<Home />} />
              <Route path="/cours" element={<Cours />} />
              <Route path="/cours/:year" element={<Cours />} />
              <Route path="/td" element={<Td />} />
              <Route path="/td/:year" element={<Td />} />
              <Route path="/a-propos" element={<AboutContact/>} />
            </Routes>
          </main>
        </div>
      </NotificationProvider>
    </ContextProvider>
  )
}

export default App
