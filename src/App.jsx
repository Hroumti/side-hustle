import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import Home from './components/home.jsx'
import Cours from './components/cours.jsx'
import Td from './components/td.jsx'
import Contact from './components/contact.jsx'
import Apropos from './components/a-propos.jsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
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
  )
}

export default App
