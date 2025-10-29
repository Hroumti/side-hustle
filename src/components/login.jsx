import React, { useRef, useContext, useState } from "react";
import { FaSignInAlt, FaLock, FaUser } from "react-icons/fa";
import { Context } from "./context"; 
import { securityUtils } from "../utils/securityUtils";
import "./styles/login.css";

function Login() {
  const { handleLogin } = useContext(Context);

  const loginInput = useRef(null);
  const pwd = useRef(null);
  const submitButtonRef = useRef(null);
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  React.useEffect(() => {
    const token = securityUtils.generateCSRFToken();
    setCsrfToken(token);
    sessionStorage.setItem('csrf_token', token);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const rawUsername = loginInput.current.value;
    const rawPassword = pwd.current.value;

    if (!securityUtils.validateUsername(rawUsername)) {
      setError("Nom d'utilisateur invalide. Utilisez uniquement des lettres, chiffres et underscores (3-20 caractères).");
      return;
    }

    if (!securityUtils.validatePassword(rawPassword)) {
      setError("Mot de passe invalide. Le mot de passe doit contenir au moins 3 caractères.");
      return;
    }

    const username = securityUtils.sanitizeInput(rawUsername);
    const password = securityUtils.sanitizeInput(rawPassword);

    const clientIP = 'client';
    if (!securityUtils.rateLimit.isAllowed(clientIP)) {
      setError("Trop de tentatives de connexion. Veuillez attendre 15 minutes avant de réessayer.");
      return;
    }

    const btn = submitButtonRef.current;
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
    btn.disabled = true;

    setTimeout(() => {
        const success = handleLogin(username, password); 
        
        if (!success) {
            setError("Nom d'utilisateur ou mot de passe incorrect.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        } else {
            securityUtils.rateLimit.reset(clientIP);
        }
    }, 800);
  };

  return (
    <div className="container login-container">
      <section className="login-section">
        <div className="login-card-wrapper">
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

              {error && (
                <div className="error login-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

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