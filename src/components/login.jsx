import React, { useRef, useContext, useState } from "react";
import { FaSignInAlt, FaLock, FaUser, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { Context } from "./context"; 
import { dbUtils } from "../utils/db-utils.js"; // <-- CRITICAL: Ensure correct import of dbUtils
import "./styles/login.css";

function Login() {
  const { handleLogin } = useContext(Context);

  const loginInput = useRef(null);
  const pwd = useRef(null);
  const submitButtonRef = useRef(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Simplified CSRF token handling
  const [csrfToken, setCsrfToken] = useState(crypto.randomUUID()); 

  React.useEffect(() => {
    // Regenerate CSRF on mount/refresh
    const token = crypto.randomUUID(); 
    setCsrfToken(token);
    sessionStorage.setItem('csrf_token', token);
  }, []);

  const handleSubmit = async (e) => { // Made async
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const rawUsername = loginInput.current.value;
      const rawPassword = pwd.current.value;

      // Enhanced validation
      if (!rawUsername || !rawPassword) {
        setError("Veuillez remplir tous les champs.");
        return;
      }

      if (rawUsername.length < 3 || rawUsername.length > 20) {
        setError("Le nom d'utilisateur doit contenir entre 3 et 20 caractères.");
        return;
      }

      if (rawPassword.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères.");
        return;
      }

      // Check rate limiting
      const clientIP = 'client'; // In a real app, you'd get the actual IP
      const { securityUtils } = await import('../utils/securityUtils.js');
      
      if (!securityUtils.rateLimit.isAllowed(clientIP, 5, 15 * 60 * 1000)) {
        setError("Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.");
        return;
      }

      // Sanitize username using the function from db-utils.js
      const username = dbUtils.sanitizeInput(rawUsername);

      // Validate CSRF token
      const storedToken = sessionStorage.getItem('csrf_token');
      if (!securityUtils.validateCSRFToken(csrfToken, storedToken)) {
        setError("Token de sécurité invalide. Veuillez actualiser la page.");
        return;
      }

      // Call the context function which handles the RTDB search and login state
      const success = await handleLogin(username, rawPassword);

      if (!success) {
        setError("Identifiants incorrects ou compte inactif.");
      } else {
        // Reset rate limit on successful login
        securityUtils.rateLimit.reset(clientIP);
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="background-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="login-container">
        <div className="login-section">
          <div className="login-card-wrapper">
            <div className="login-floating-cards">
              <div className="floating-card card-1"></div>
              <div className="floating-card card-2"></div>
              <div className="floating-card card-3"></div>
              <div className="floating-card card-4"></div>
            </div>
            
            <div className="login-card">
              <div className="login-header">
                <div className="login-icon">
                  <FaLock />
                </div>
                <h1 className="login-title">
                  Bienvenue <span className="title-line-2">de retour</span>
                </h1>
                <p className="login-subtitle">Accédez à votre compte pour gérer les utilisateurs.</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                {/* Using a dynamic CSRF token for basic protection */}
                <input type="hidden" name="csrf_token" value={csrfToken} /> 
                
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Nom d'utilisateur"
                    required
                    ref={loginInput}
                    autoComplete="username"
                    maxLength="20"
                  />
                </div>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    required
                    ref={pwd}
                    autoComplete="current-password"
                    minLength="3"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {error && (
                  <div className="error login-error">
                      <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary btn-login"
                  ref={submitButtonRef}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="spinner" /> Connexion...
                    </>
                  ) : (
                    <>
                      Se connecter <FaSignInAlt />
                    </>
                  )}
                </button>
              </form>

              <div className="login-footer">
                <p>Besoin d'aide ? <a href="#contact">Contactez l'administrateur</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
