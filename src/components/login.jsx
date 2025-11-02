import React, { useRef, useContext, useState } from "react";
import { FaSignInAlt, FaLock, FaUser } from "react-icons/fa";
import { Context } from "./context"; 
import { dbUtils } from "../utils/db-utils.js"; // <-- CRITICAL: Ensure correct import of dbUtils
import "./styles/login.css";

function Login() {
  const { handleLogin } = useContext(Context);

  const loginInput = useRef(null);
  const pwd = useRef(null);
  const submitButtonRef = useRef(null);
  const [error, setError] = useState('');
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

    const rawUsername = loginInput.current.value;
    const rawPassword = pwd.current.value;

    // Minimal validation
    if (rawUsername.length < 3 || rawPassword.length < 3) {
      setError("Nom d'utilisateur ou mot de passe trop court.");
      return;
    }

    // Sanitize username using the function from db-utils.js
    const username = dbUtils.sanitizeInput(rawUsername);

    // Call the context function which handles the RTDB search and login state
    const success = await handleLogin(username, rawPassword);

    if (!success) {
        setError("Identifiants incorrects ou compte inactif.");
    }
  };

  return (
    <div className="login-container">
      <section className="login-box">
        <div className="login-header">
          <h1>Connexion</h1>
          <p>Accédez à votre compte pour gérer les utilisateurs.</p>
        </div>
        <div className="login-content">
          <div className="form-wrapper">

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Using a dynamic CSRF token for basic protection */}
              <input type="hidden" name="csrf_token" value={csrfToken} /> 
              
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
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
