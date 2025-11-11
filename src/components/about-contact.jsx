import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
    FaUserTie, 
    FaBook, 
    FaFileAlt, 
    FaEnvelope,
    FaLink,
    FaArrowRight,
    FaLightbulb
} from 'react-icons/fa'
import './styles/about-contact.css'

export default function AboutContact(){
    const location = useLocation();
    
    useEffect(() => {
        // Security: Only handle scroll if coming from login page with specific parameters
        const urlParams = new URLSearchParams(location.search);
        const scrollTo = urlParams.get('scrollTo');
        const from = urlParams.get('from');
        
        // Validate parameters for security
        const validScrollTargets = ['contact']; // Whitelist of allowed scroll targets
        const validSources = ['login']; // Whitelist of allowed source pages
        
        if (scrollTo && from && 
            validScrollTargets.includes(scrollTo) && 
            validSources.includes(from)) {
            
            // Small delay to ensure the component is fully rendered
            setTimeout(() => {
                const targetElement = document.getElementById(scrollTo);
                if (targetElement) {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Clean up URL parameters after scrolling (optional)
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                }
            }, 100);
        }
    }, [location]);

    return (
        <div className="ac-page-container">
            <section className="ac-hero-section">
                <div className="ac-hero-content">
                    <div className="ac-profile-card">
                        <div className="ac-profile-image">
                            <FaUserTie />
                        </div>
                        <div className="ac-profile-info">
                            <h1 className="ac-professor-name">Dr. Ouafa Barkat</h1>
                            <p className="ac-professor-title">Enseignant-chercheuse enseignante</p>
                            <p className="ac-university">ENCG - Agadir</p>
                        </div>
                    </div>
                    
                    <div className="ac-intro-text">
                        <h2>Bienvenue sur mon espace pédagogique</h2>
                        <p>
                            Cet espace est dédié au partage de ressources pédagogiques avec mes étudiants. 
                            Vous y trouverez l'ensemble de mes cours, travaux dirigés, et supports de formation 
                            en marketing et comportement du consommateur.
                        </p>
                    </div>
                </div>
            </section>

            <section className="ac-background-section">
                <div className="ac-background-content">
                    <div className="ac-background-text">
                        <h2>Parcours académique</h2>
                        <div className="ac-education-item">
                            <h4>Doctorat en Sciences de Gestion</h4>
                            <p>Spécialisation Marketing - Université [Nom] (2018-2022)</p>
                        </div>
                        <div className="ac-education-item">
                            <h4>Master Recherche en Marketing</h4>
                            <p>Mention Très Bien - Université [Nom] (2016-2018)</p>
                        </div>
                        <div className="ac-education-item">
                            <h4>Licence Économie-Gestion</h4>
                            <p>Parcours Marketing - Université [Nom] (2013-2016)</p>
                        </div>
                    </div>
                    
                    <div className="ac-research-interests">
                        <h3><FaLightbulb /> Intérêts de recherche</h3>
                        <ul>
                            <li>Comportement du consommateur digital</li>
                            <li>Influence des réseaux sociaux</li>
                            <li>Marketing expérientiel</li>
                            <li>Neuromarketing</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="ac-contact-section" id="contact">
                <div className="ac-section-header">
                    <h2>Contactez-moi</h2>
                    <p>Pour toute question concernant les cours, les TDs ou pour prendre rendez-vous</p>
                </div>
                
                <div className="ac-contact-content">
                    <div className="ac-contact-grid">
                        <div className="ac-info-card">
                            <div className="ac-card-header">
                                <div className="ac-card-icon">
                                    <FaEnvelope />
                                </div>
                                <h3>Coordonnées</h3>
                            </div>
                            <div className="ac-card-content">
                                <div className="ac-contact-item">
                                    <FaEnvelope />
                                    <div>
                                        <strong>Email professionnel</strong>
                                        <p>o.barakat@uiz.ac.ma</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ac-info-card">
                            <div className="ac-card-header">
                                <div className="ac-card-icon">
                                    <FaLink />
                                </div>
                                <h3>Liens utiles</h3>
                            </div>
                            <div className="ac-card-content">
                                <div className="ac-resource-links">
                                    <Link to="/cours" className="ac-resource-link">
                                        <FaBook />
                                        <span>Consulter les cours</span>
                                        <FaArrowRight />
                                    </Link>
                                    <Link to="/td" className="ac-resource-link">
                                        <FaFileAlt />
                                        <span>Voir les TDs</span>
                                        <FaArrowRight />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
