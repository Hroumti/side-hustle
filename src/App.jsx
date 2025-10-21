<<<<<<< Updated upstream
import Navbar from './components/navbar.jsx'
import Home from './components/home.jsx'
import './App.css'
=======
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Home from "./components/home.jsx";
import Cours from "./components/cours.jsx";
import Td from "./components/td.jsx";
import "./App.css";
>>>>>>> Stashed changes

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
<<<<<<< Updated upstream
        <Home />
=======
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cours" element={<Cours />} />
          <Route path="/cours/:year" element={<Cours />} />
          <Route path="/td" element={<Td />} />
          <Route path="/td/:year" element={<Td />} />
          <Route
            path="/a-propos"
            element={<div style={{ padding: "2rem" }}>À propos</div>}
          />
          <Route
            path="/contact"
            element={<div style={{ padding: "2rem" }}>Contact</div>}
          />
        </Routes>
>>>>>>> Stashed changes
      </main>
    </div>
  );
}

export default App;
