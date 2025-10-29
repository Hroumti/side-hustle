import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  FaBook,
  FaFilePowerpoint,
  FaArrowRight,
  FaGraduationCap,
  FaRocket,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { fileOperations } from "../utils/fileOperations";
import { Context } from "./context";
import EncgFixed from "../assets/EncgFixed.png";
import TdImage from "../assets/tdimage.png";
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
        // First try to get files from localStorage (admin-managed files)
        let coursRaw = fileOperations.getPublicFiles("cours");
        let tdRaw = fileOperations.getPublicFiles("td");
        
        // If no files in localStorage, fallback to original JSON
        if (coursRaw.length === 0) {
          try {
            const cRes = await fetch("/cours/index.json", { cache: "no-store" });
            if (cRes.ok) {
              coursRaw = await cRes.json();
            }
          } catch (e) {
            console.warn("Could not load cours index.json:", e);
          }
        }
        
        if (tdRaw.length === 0) {
          try {
            const tRes = await fetch("/td/index.json", { cache: "no-store" });
            if (tRes.ok) {
              tdRaw = await tRes.json();
            }
          } catch (e) {
            console.warn("Could not load td index.json:", e);
          }
        }

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
          setCoursItems(normalize(coursRaw));
          setTdItems(normalize(tdRaw));
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Impossible de charger les aperçus.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    
    // Listen for storage changes and custom events to update files when admin makes changes
    const handleStorageChange = (e) => {
      if (e.key === 'encg_cours_files' || e.key === 'encg_td_files') {
        load();
      }
    };
    
    const handleFilesUpdated = (e) => {
      if (e.detail.type === 'cours' || e.detail.type === 'td') {
        load();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('filesUpdated', handleFilesUpdated);
    
    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('filesUpdated', handleFilesUpdated);
    };
  }, []);

  return { coursItems, tdItems, loading, error };
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("fr-FR") : "—";
}

function HeroCarousel({ autoPlay = true, autoPlayInterval = 3000, role }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  const slides = [
    {
      id: 'welcome',
      type: 'welcome'
    },
    {
      id: 'courses',
      type: 'overlay',
      title: 'Explorez nos Cours',
      description: 'Découvrez une vaste collection de cours organisés par matière et niveau. Accédez aux ressources pédagogiques de qualité pour enrichir vos connaissances.',
      buttonText: 'Voir les Cours',
      buttonLink: '/cours',
      buttonIcon: FaBook
    },
    {
      id: 'td',
      type: 'overlay',
      title: 'Travaux Dirigés',
      description: 'Entraînez-vous avec nos exercices pratiques et TDs. Mettez en pratique vos connaissances théoriques avec des cas concrets et des corrections détaillées.',
      buttonText: 'Découvrir les TDs',
      buttonLink: '/td',
      buttonIcon: FaFilePowerpoint
    }
  ];

  useEffect(() => {
    let interval;
    
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, autoPlayInterval, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(autoPlay);
  };

  return (
    <div 
      className="hero-carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-container">
        <div 
          className="carousel-slides"
          style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
        >
          {/* Slide 1: Welcome */}
          <div className="carousel-slide slide-welcome">
            <div className="background-elements" aria-hidden="true">
              <div className="floating-shape shape-1" />
              <div className="floating-shape shape-2" />
              <div className="floating-shape shape-3" />
            </div>
            
            <section className="hero-section">
              <div className="hero-content">
                  <h1 className="hero-title">
                    <span className="title-line-1">Bienvenue à</span>
                    <span className="title-line-2">ENCG Barakat</span>
                  </h1>
                  
                  <p className="hero-description">
                    {role ? (
                      <>
                        Bienvenue ! Accédez aux cours et TDs, prévisualisez et téléchargez en un clic.
                        Trouvez rapidement les ressources dont vous avez besoin pour réussir.
                      </>
                    ) : (
                      <>
                        Explorez librement notre collection de cours et TDs. 
                        Connectez-vous pour télécharger et prévisualiser les ressources.
                      </>
                    )}
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
                    {!role && (
                      <Link to="/login" className="btn btn-secondary">
                        <FaGraduationCap />
                        Se connecter
                      </Link>
                    )}
                  </div>
                

                
              </div>
            </section>
          </div>

          {/* Slide 2: Courses */}
          <div className="carousel-slide slide-courses" style={{
        background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${EncgFixed})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
      }}>
            <div className="slide-content">
              <div className="slide-overlay-content">
                <h1>{slides[1].title}</h1>
                <p>{slides[1].description}</p>
                <Link to={slides[1].buttonLink} className="slide-cta-button">
                  {React.createElement(slides[1].buttonIcon)}
                  {slides[1].buttonText}
                  <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>

          {/* Slide 3: TDs */}
          <div className="carousel-slide slide-td" style={{
        background: `url(${TdImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white", // text color
      }}>
            <div className="slide-content">
              <div className="slide-overlay-content">
                <h1>{slides[2].title}</h1>
                <p>{slides[2].description}</p>
                <Link to={slides[2].buttonLink} className="slide-cta-button">
                  {React.createElement(slides[2].buttonIcon)}
                  {slides[2].buttonText}
                  <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          className={`carousel-arrow carousel-arrow-left ${currentSlide === 0 ? 'hidden' : ''}`}
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <FaChevronLeft />
        </button>
        
        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <FaChevronRight />
        </button>

        {/* Navigation Dots */}
        <div className="carousel-nav">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`nav-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { coursItems, tdItems, loading, error } = usePreviewData();
  const { role } = useContext(Context);

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
      {/* Hero Carousel */}
      <HeroCarousel autoPlay={true} autoPlayInterval={6000} role={role} />

      {/* Preview Section */}
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

            <Link to="/cours" className="card-button">
              Voir Cours <FaArrowRight />
            </Link>
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

            <Link to="/td" className="card-button">
              Voir TD <FaArrowRight />
            </Link>
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