import React, { useRef, useContext, useState } from "react";
import { FaSignInAlt, FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// Assuming 'Context' is your authentication context
import { Context } from "./context"; 
import { securityUtils } from "../utils/securityUtils";

import "./styles/login.css";

function Login() {
  const { handleLogin } = useContext(Context);
  const navigate = useNavigate();

  const loginInput = useRef(null);
  const pwd = useRef(null);
  const submitButtonRef = useRef(null);
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  // Generate CSRF token on component mount
  React.useEffect(() => {
    const token = securityUtils.generateCSRFToken();
    setCsrfToken(token);
    // Store token in sessionStorage for validation
    sessionStorage.setItem('csrf_token', token);
  }, []);

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

    // Get raw input values
    const rawUsername = loginInput.current.value;
    const rawPassword = pwd.current.value;

    // Validate and sanitize inputs
    if (!securityUtils.validateUsername(rawUsername)) {
      setError("Nom d'utilisateur invalide. Utilisez uniquement des lettres, chiffres et underscores (3-20 caractères).");
      return;
    }

    if (!securityUtils.validatePassword(rawPassword)) {
      setError("Mot de passe invalide. Le mot de passe doit contenir au moins 3 caractères.");
      return;
    }

    // Sanitize inputs to prevent XSS and injection attacks
    const username = securityUtils.sanitizeInput(rawUsername);
    const password = securityUtils.sanitizeInput(rawPassword);

    // Check rate limiting (using a simple client-side check)
    const clientIP = 'client'; // In a real app, you'd get the actual IP
    if (!securityUtils.rateLimit.isAllowed(clientIP)) {
      setError("Trop de tentatives de connexion. Veuillez attendre 15 minutes avant de réessayer.");
      return;
    }

    const btn = submitButtonRef.current;
    const originalText = btn.innerHTML;
    
    // 1. Show Loading State (Visual Only)
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
    btn.disabled = true;

    // Simulate an API call delay
    setTimeout(() => {
        // 2. Authentication Check: Call handleLogin and capture status
        // handleLogin now returns true/false
        const success = handleLogin(username, password); 
        
        if (!success) {
            // 3. Handle Failure: Display error and re-enable button
            setError("Nom d'utilisateur ou mot de passe incorrect.");
            btn.innerHTML = originalText;
            btn.disabled = false; // <-- Button re-enabled on failure
        } else {
            // Reset rate limiting on successful login
            securityUtils.rateLimit.reset(clientIP);
        }
        
        // If success is true, handleLogin navigated away, and the button state is irrelevant.
        
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
              {/* Hidden CSRF token field */}
              <input type="hidden" name="csrf_token" value={csrfToken} />
              
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Nom d'utilisateur ou Email"
                  required
                  ref={loginInput}
                  autoComplete="username"
                  maxLength="20"
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
                  minLength="3"
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