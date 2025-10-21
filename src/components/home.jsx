import React from "react";
import { Link } from "react-router-dom";
import {
  FaBook,
  FaFilePowerpoint,
  FaArrowRight,
  FaGraduationCap,
  FaRocket,
  FaEye,
} from "react-icons/fa";

import "./styles/home.css";

function usePreviewData() {
  const [coursItems, setCoursItems] = React.useState([]);
  const [tdItems, setTdItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [cRes, tRes] = await Promise.all([
          fetch("/cours/index.json", { cache: "no-store" }).catch(() => ({
            ok: false,
          })),
          fetch("/td/index.json", { cache: "no-store" }).catch(() => ({
            ok: false,
          })),
        ]);

        const cJson = cRes.ok ? await cRes.json() : [];
        const tJson = tRes.ok ? await tRes.json() : [];

        const normalize = (data) => {
          if (!Array.isArray(data)) return [];
          return data
            .map((item) => ({
              name: item.name || item.url?.split("/").pop() || "Fichier",
              url: item.url,
              uploadedAt: item.uploadedAt || item.uploaded || null,
            }))
            .sort((a, b) => {
              const da = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
              const db = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
              return db - da;
            })
            .slice(0, 3);
        };

        if (mounted) {
          setCoursItems(normalize(cJson));
          setTdItems(normalize(tJson));
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Impossible de charger les aperçus.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { coursItems, tdItems, loading, error };
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("fr-FR") : "—";
}

export default function Home() {
  const { coursItems, tdItems, loading, error } = usePreviewData();

  React.useEffect(() => {
    // animations: intersection observer for animate-in
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = "running";
          entry.target.classList.add("animate-in");
          // once animated, unobserve
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animated = document.querySelectorAll(
      ".preview-card, .cta-card, .stat-card, .preview-item"
    );
    animated.forEach((el) => observer.observe(el));

    // parallax for floating-shape (if present) and floating cards
    const shapes = document.querySelectorAll(
      ".floating-shape, .floating-card, .bubble"
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

    // button temporary loading state (visual only)
    const actionButtons = Array.from(
      document.querySelectorAll(".btn, .card-button")
    );
    const onClick = (e) => {
      const btn = e.currentTarget;
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
      setTimeout(() => (btn.innerHTML = original), 800);
    };
    actionButtons.forEach((b) => b.addEventListener("click", onClick));

    // resize debounce to adjust floating animation speed
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const isMobile = window.innerWidth <= 768;
        document.querySelectorAll(".floating-card").forEach((card) => {
          card.style.animationDuration = isMobile ? "4s" : "6s";
        });
      }, 150);
    };
    window.addEventListener("resize", onResize);

    // reduced motion preference
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      document.documentElement.classList.add("prefers-reduced-motion");
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      actionButtons.forEach((b) => b.removeEventListener("click", onClick));
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="container">
      <div className="background-elements" aria-hidden>
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
      </div>

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <div className="badge">🎓 Plateforme Éducative</div>
            <h1 className="hero-title">
              <span className="title-line-1">Bienvenue à</span>
              <span className="title-line-2">ENCG Barakat</span>
            </h1>
            <p className="hero-subtitle">
              Boostez votre savoir, partagez et inspirez avec notre plateforme
              collaborative moderne.
            </p>
            <p className="hero-description">
              Accédez aux cours et TDs, prévisualisez et téléchargez en un clic.
              Trouvez rapidement les ressources dont vous avez besoin pour
              réussir.
            </p>

            <div className="hero-buttons">
              <Link to="/cours" className="btn btn-primary">
                <FaRocket />
                Explorer les cours
              </Link>
              <Link to="/td" className="btn btn-secondary">
                <FaEye />
                Voir les TDs
              </Link>
            </div>
          </div>

          <div className="hero-right">
            <div className="floating-cards">
              <div className="floating-card card-1" />
              <div className="floating-card card-2" />
              <div className="floating-card card-3" />
              <div className="floating-card card-4" />
            </div>
            <div className="central-icon">
              <FaGraduationCap className="central-fa" fontSize="5rem" />
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card stat-blue">
              <i className="fas fa-book" />
              <div className="stat-info">
                <div className="stat-number">500+</div>
                <div className="stat-label">Cours</div>
              </div>
            </div>

            <div className="stat-card stat-purple">
              <i className="fas fa-file-powerpoint" />
              <div className="stat-info">
                <div className="stat-number">200+</div>
                <div className="stat-label">TDs</div>
              </div>
            </div>

            <div className="stat-card stat-indigo">
              <i className="fas fa-users" />
              <div className="stat-info">
                <div className="stat-number">1K+</div>
                <div className="stat-label">Étudiants</div>
              </div>
            </div>

            <div className="stat-card stat-pink">
              <i className="fas fa-download" />
              <div className="stat-info">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Téléchargements</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="preview-section">
        <div className="section-header">
          <h2 className="section-title">Aperçus récents</h2>
          <p className="section-description">
            Découvrez les derniers contenus ajoutés à notre plateforme
          </p>
        </div>

        <div className="preview-grid">
          <div className="preview-card">
            <div className="card-header">
              <div className="card-icon">
                <FaBook />
              </div>
              <div className="card-badge">PDF / PPT</div>
            </div>
            <h3 className="card-title">Cours</h3>
            <p className="card-description">
              Derniers cours ajoutés par nos professeurs
            </p>

            <div className="preview-items" id="cours-items">
              {loading ? (
                <div className="loading">
                  <div className="loading-dots">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>
                  <span>Chargement des aperçus…</span>
                </div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : coursItems.length === 0 ? (
                <div className="no-items">Aucun élément disponible</div>
              ) : (
                coursItems.map((it, i) => (
                  <div className="preview-item" key={`cours-${i}`}>
                    <span className="preview-item-name" title={it.name}>
                      {it.name}
                    </span>
                    <span className="preview-item-date">
                      {formatDate(it.uploadedAt)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <a href="/cours" className="card-button">
              Voir Cours <FaArrowRight />
            </a>
          </div>

          <div className="preview-card">
            <div className="card-header">
              <div className="card-icon">
                <FaFilePowerpoint />
              </div>
              <div className="card-badge">Exercices</div>
            </div>
            <h3 className="card-title">TD</h3>
            <p className="card-description">
              Derniers TDs et exercices pratiques disponibles
            </p>

            <div className="preview-items" id="td-items">
              {loading ? (
                <div className="loading">
                  <div className="loading-dots">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>
                  <span>Chargement des aperçus…</span>
                </div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : tdItems.length === 0 ? (
                <div className="no-items">Aucun élément disponible</div>
              ) : (
                tdItems.map((it, i) => (
                  <div className="preview-item" key={`td-${i}`}>
                    <span className="preview-item-name" title={it.name}>
                      {it.name}
                    </span>
                    <span className="preview-item-date">
                      {formatDate(it.uploadedAt)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <a href="/td" className="card-button">
              Voir TD <FaArrowRight />
            </a>
          </div>
        </div>

        <div className="cta-grid">
          <Link to="/cours" className="cta-card cta-blue">
            <div className="cta-background" />
            <div className="cta-content">
              <div className="cta-icon">
                <FaBook />
              </div>
              <div className="cta-text">
                <h3>Explorer les cours</h3>
                <p>
                  Accédez à l'ensemble des cours classés par année et matière.
                  Téléchargez, prévisualisez et organisez vos ressources.
                </p>
                <div className="cta-link">
                  Commencer maintenant <FaArrowRight />
                </div>
              </div>
            </div>
          </Link>

          <Link to="/td" className="cta-card cta-purple">
            <div className="cta-background" />
            <div className="cta-content">
              <div className="cta-icon">
                <FaFilePowerpoint />
              </div>
              <div className="cta-text">
                <h3>Voir les TDs</h3>
                <p>
                  Trouvez des exercices, corrigés et supports pratiques.
                  Entraînez-vous et améliorez vos compétences.
                </p>
                <div className="cta-link">
                  Découvrir les TDs <FaArrowRight />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
