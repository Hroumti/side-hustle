import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "./styles/navbar.css";
import { Context } from "./context";

const Navbar = () => {

  const {role, logout} = useContext(Context)

  const [isOpen, setIsOpen] = useState(false);
  const [isCoursOpen, setIsCoursOpen] = useState(false);
  const [isTdOpen, setIsTdOpen] = useState(false);
  const location = useLocation();

  const handleToggle = () => setIsOpen((prev) => !prev);
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
      <nav className="navbar">
        <div className="navbar-container">
        <Link to="/" className="navbar-link" onClick={handleNavigate}>
          <div className="navbar-brand">
            <img src="ENCG_Barakat_navbar.png" alt="" />
            <h2>ENCG Barakat</h2>
          </div></Link>

          <button
            className={`navbar-toggle${isOpen ? " is-open" : ""}`}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="primary-navigation"
            onClick={handleToggle}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>

          <ul
            id="primary-navigation"
            className={`navbar-menu${isOpen ? " is-open" : ""}`}
          >
            <li className="navbar-item">
              <Link to="/" className="navbar-link" onClick={handleNavigate}>
                Accueil
              </Link>
            </li>

            <li
              className={`navbar-item dropdown${isCoursOpen ? " is-open" : ""}`}
            >
              <button
                type="button"
                className="navbar-link dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={isCoursOpen}
                onClick={() => setIsCoursOpen((prev) => !prev)}
              >
                Cours ▾
              </button>
              <ul className="dropdown-menu" role="menu">
                <li>
                  <Link to="/cours/3eme" className="navbar-link" onClick={handleNavigate}>
                    3éme année ENCG
                  </Link>
                </li>
                <li>
                  <Link to="/cours/4eme" className="navbar-link" onClick={handleNavigate}>
                    4éme année ENCG
                  </Link>
                </li>
                <li>
                  <Link to="/cours/5eme" className="navbar-link" onClick={handleNavigate}>
                    5éme année ENCG
                  </Link>
                </li>
              </ul>
            </li>

            <li className={`navbar-item dropdown${isTdOpen ? " is-open" : ""}`}>
              <button
                type="button"
                className="navbar-link dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={isTdOpen}
                onClick={() => setIsTdOpen((prev) => !prev)}
              >
                TD ▾
              </button>
              <ul className="dropdown-menu" role="menu">
                <li>
                  <Link to="/td/3eme" className="navbar-link" onClick={handleNavigate}>
                    3éme année ENCG
                  </Link>
                </li>
                <li>
                  <Link to="/td/4eme" className="navbar-link" onClick={handleNavigate}>
                    4éme année ENCG
                  </Link>
                </li>
                <li>
                  <Link to="/td/5eme" className="navbar-link" onClick={handleNavigate}>
                    5éme année ENCG
                  </Link>
                </li>
              </ul>
            </li>

            <li className="navbar-item">
              <Link
                to="/a-propos"
                className="navbar-link"
                onClick={handleNavigate}
              >
                À propos
              </Link>
            </li>
            {role === 'admin' && (
              <li className="navbar-item">
                <Link
                  to="/dashboard"
                  className="navbar-link"
                  onClick={handleNavigate}
                >
                  Dashboard
                </Link>
              </li>
            )}
            {role?
            <li className="navbar-item">
              <Link
                to="/login"
                className="navbar-link"
                onClick={logout}
              >
                Diconnecter
              </Link>
            </li>
            :(<li className="navbar-item">
              <Link
                to="/login"
                className="navbar-link"
                onClick={handleNavigate}
              >
                login
              </Link>
            </li>)}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;