import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import Home from './components/home.jsx'
import CoursNew from './components/CoursNew.jsx'
import TdNew from './components/TdNew.jsx'
import AboutContact from './components/about-contact.jsx'
import Seminars from './components/seminars.jsx'
import Login from './components/login.jsx'
import Dashboard from './components/dashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import { ContextProvider } from './components/context.jsx'
import { NotificationProvider } from './components/NotificationContext.jsx'
import './App.css'

function App() {
  // Mock data initialization useEffect removed.
  // Auth and data are now managed by ContextProvider.

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
              <Route path="/cours" element={<CoursNew />} />
              <Route path="/cours/:year" element={<CoursNew />} />
              <Route path="/td" element={<TdNew />} />
              <Route path="/td/:year" element={<TdNew />} />
              <Route path="/seminaires" element={<Seminars />} />
              <Route path="/a-propos" element={<AboutContact/>} />
            </Routes>
          </main>
        </div>
      </NotificationProvider>
    </ContextProvider>
  )
}

export default App
