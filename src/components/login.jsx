import React from "react";
import { FaSignInAlt, FaLock, FaUser } from "react-icons/fa";
// Make sure to adjust the path to your style file if needed
import "./styles/login.css";

function Login() {
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
        // Subtle difference in speed for a more dynamic effect
        const speed = (index + 1) * 0.05;
        shape.style.transform = `translateY(${rate * speed}px)`;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // Button temporary loading state (visual only)
    const actionButton = document.querySelector(".btn-login");
    const onClick = (e) => {
      // Prevent actual form submission for this visual demo
      e.preventDefault(); 
      const btn = e.currentTarget;
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
      
      // Simulate loading for 800ms
      setTimeout(() => (btn.innerHTML = originalText), 800);
    };
    if (actionButton) {
        actionButton.addEventListener("click", onClick);
    }


    // Reduced motion preference
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      document.documentElement.classList.add("prefers-reduced-motion");
    }


    return () => {
      window.removeEventListener("scroll", onScroll);
      if (actionButton) {
        actionButton.removeEventListener("click", onClick);
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for handling login submission goes here
    console.log("Login attempted.");
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
                />
              </div>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-login">
                Se connecter
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;