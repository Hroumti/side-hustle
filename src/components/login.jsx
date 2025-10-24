import React, { useRef, useContext, useState } from "react";
import { FaSignInAlt, FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// Assuming 'Context' is your authentication context
import Context from "./context"; 

import "./styles/login.css";

function Login() {
  const { handleLogin } = useContext(Context);
  const navigate = useNavigate();

  const loginInput = useRef(null);
  const pwd = useRef(null);
  const submitButtonRef = useRef(null);
  const [error, setError] = useState('');

  // --- Visual Effects (Parallax and Reduced Motion) ---
  React.useEffect(() => {
    // Parallax for floating cards and central icon
    const shapes = document.querySelectorAll(
      ".floating-shape, .floating-card, .central-icon"
    );
    function onScroll() {
      const scrolled =
        window.pageYOffset || document.documentElement.scrollTop || 0;
      const rate = scrolled * -0.5;
      shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.05;
        shape.style.transform = `translateY(${rate * speed}px)`;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // Reduced motion preference
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      document.documentElement.classList.add("prefers-reduced-motion");
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // --- Form Submission Logic ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const username = loginInput.current.value;
    const password = pwd.current.value;

    const btn = submitButtonRef.current;
    const originalText = btn.innerHTML;
    
    // 1. Show Loading State (Visual Only)
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
    btn.disabled = true;

    // Simulate an API call delay
    setTimeout(() => {
        // 2. Mock Authentication Check
        if (username !== '' && password !== '') {
            handleLogin(username); // Set context state
        } else {
            // 3. Handle Error
            setError("Nom d'utilisateur ou mot de passe incorrect.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }, 800);
  };

  return (
    <div className="container login-container">
      <div className="background-elements" aria-hidden>
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
      </div>

      <section className="login-section">
        <div className="login-card-wrapper">
          <div className="floating-cards login-floating-cards" aria-hidden>
            <div className="floating-card card-1" />
            <div className="floating-card card-2" />
            <div className="floating-card card-3" />
            <div className="floating-card card-4" />
          </div>

          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">
                <FaSignInAlt />
              </div>
              <h1 className="login-title">
                Accédez à <span className="title-line-2">ENCG Barakat</span>
              </h1>
              <p className="login-subtitle">
                Connectez-vous pour accéder à vos ressources éducatives.
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Nom d'utilisateur ou Email"
                  required
                  ref={loginInput}
                  autoComplete="username"
                />
              </div>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  required
                  ref={pwd}
                  autoComplete="current-password"
                />
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="error login-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              {/* Button Change: Use <button> for icons/text children */}
              <button 
                type="submit" 
                className="btn btn-primary btn-login"
                ref={submitButtonRef}
              >
                Se connecter <FaSignInAlt />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;