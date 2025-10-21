import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import encg from '../assets/encg.jpeg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCoursOpen, setIsCoursOpen] = useState(false);
  const [isTdOpen, setIsTdOpen] = useState(false);
  const location = useLocation();

  const handleToggle = () => setIsOpen(prev => !prev);
  const handleNavigate = () => {
    setIsOpen(false);
    setIsCoursOpen(false);
    setIsTdOpen(false);
  };

  React.useEffect(() => {
    setIsOpen(false);
    setIsCoursOpen(false);
    setIsTdOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* ✅ Banner Section */}
      <div className="banner-container">
        <img src={encg} alt="ENCG Banner" className="banner-image" />
      </div>

      {/* ✅ Single Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <img src="ENCG_Barakat_navbar.png" alt="" />
            <h2>ENCG Barakat</h2>
          </div>

          <button
            className={`navbar-toggle${isOpen ? ' is-open' : ''}`}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="primary-navigation"
            onClick={handleToggle}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>

          <ul
            id="primary-navigation"
            className={`navbar-menu${isOpen ? ' is-open' : ''}`}
          >
            <li className="navbar-item">
              <Link to="/" className="navbar-link" onClick={handleNavigate}>Accueil</Link>
            </li>

            <li className={`navbar-item dropdown${isCoursOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="navbar-link dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={isCoursOpen}
                onClick={() => setIsCoursOpen(prev => !prev)}
              >
                Cours ▾
              </button>
              <ul className="dropdown-menu" role="menu">
                <li><Link to="/cours/3eme" onClick={handleNavigate}>3éme année ENCG</Link></li>
                <li><Link to="/cours/4eme" onClick={handleNavigate}>4éme année ENCG</Link></li>
                <li><Link to="/cours/5eme" onClick={handleNavigate}>5éme année ENCG</Link></li>
              </ul>
            </li>

            <li className={`navbar-item dropdown${isTdOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="navbar-link dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={isTdOpen}
                onClick={() => setIsTdOpen(prev => !prev)}
              >
                TD ▾
              </button>
              <ul className="dropdown-menu" role="menu">
                <li><Link to="/td/3eme" onClick={handleNavigate}>3éme année ENCG</Link></li>
                <li><Link to="/td/4eme" onClick={handleNavigate}>4éme année ENCG</Link></li>
                <li><Link to="/td/5eme" onClick={handleNavigate}>5éme année ENCG</Link></li>
              </ul>
            </li>

            <li className="navbar-item">
              <Link to="/a-propos" className="navbar-link" onClick={handleNavigate}>À propos</Link>
            </li>
            <li className="navbar-item">
              <Link to="/contact" className="navbar-link" onClick={handleNavigate}>Contact</Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
