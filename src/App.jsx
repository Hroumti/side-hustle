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
import { ContextProvider } from './components/context.jsx'
import { initializeFiles } from './utils/initializeFiles.js'
import './App.css'

function App() {
  // Initialize files when app starts
  React.useEffect(() => {
    initializeFiles();
  }, []);

  return (
    <ContextProvider>
      <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path='/login' element={<Login/>}/>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/cours" element={<Cours />} />
          <Route path="/cours/:year" element={<Cours />} />
          <Route path="/td" element={<Td />} />
          <Route path="/td/:year" element={<Td />} />
          <Route path="/a-propos" element={<Apropos/>} />
          <Route path="/contact" element={<Contact/>} />
        </Routes>
      </main>
    </div>
    </ContextProvider>
  )
}

export default App
