import React from 'react'
import { Link } from 'react-router-dom'
import { 
    FaUserTie, 
    FaBook, 
    FaUsers, 
    FaFileAlt, 
    FaCalendarAlt,
    FaChartLine,
    FaBrain,
    FaLaptop,
    FaSearch,
    FaEnvelope,
    FaPhone,
    FaLink,
    FaArrowRight,
    FaGraduationCap,
    FaAward,
    FaLightbulb
} from 'react-icons/fa'
import './styles/about-contact.css'

export default function AboutContact(){
    return (
        <div className="ac-page-container">
            <section className="ac-hero-section">
                <div className="ac-hero-content">
                    <div className="ac-profile-card">
                        <div className="ac-profile-image">
                            <FaUserTie />
                        </div>
                        <div className="ac-profile-info">
                            <h1 className="ac-professor-name">Professeur Barakat</h1>
                            <p className="ac-professor-title">Enseignant-Chercheur en Marketing</p>
                            <p className="ac-university">Université ENCG</p>
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

            <section className="ac-stats-section">
                <div className="ac-stats-grid">
                    <div className="ac-stat-item">
                        <div className="ac-stat-icon">
                            <FaBook />
                        </div>
                        <div className="ac-stat-content">
                            <div className="ac-stat-number">12</div>
                            <div className="ac-stat-label">Cours disponibles</div>
                        </div>
                    </div>
                    <div className="ac-stat-item">
                        <div className="ac-stat-icon">
                            <FaUsers />
                        </div>
                        <div className="ac-stat-content">
                            <div className="ac-stat-number">200+</div>
                            <div className="ac-stat-label">Étudiants</div>
                        </div>
                    </div>
                    <div className="ac-stat-item">
                        <div className="ac-stat-icon">
                            <FaFileAlt />
                        </div>
                        <div className="ac-stat-content">
                            <div className="ac-stat-number">25</div>
                            <div className="ac-stat-label">TDs & Exercices</div>
                        </div>
                    </div>
                    <div className="ac-stat-item">
                        <div className="ac-stat-icon">
                            <FaCalendarAlt />
                        </div>
                        <div className="ac-stat-content">
                            <div className="ac-stat-number">5</div>
                            <div className="ac-stat-label">Années d'expérience</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ac-teaching-section">
                <div className="ac-section-header">
                    <h2>Domaines d'enseignement</h2>
                    <p>Les matières que j'enseigne et pour lesquelles je propose des ressources</p>
                </div>
                
                <div className="ac-subjects-grid">
                    <div className="ac-subject-card">
                        <div className="ac-subject-icon">
                            <FaChartLine />
                        </div>
                        <h3>Marketing Fondamental</h3>
                        <p>Concepts de base, stratégies marketing, mix marketing et analyse de marché</p>
                        <div className="ac-subject-levels">
                            <span className="ac-level-tag">L2</span>
                            <span className="ac-level-tag">L3</span>
                        </div>
                    </div>

                    <div className="ac-subject-card">
                        <div className="ac-subject-icon">
                            <FaBrain />
                        </div>
                        <h3>Comportement du Consommateur</h3>
                        <p>Psychologie du consommateur, processus de décision et facteurs d'influence</p>
                        <div className="ac-subject-levels">
                            <span className="ac-level-tag">L3</span>
                            <span className="ac-level-tag">M1</span>
                        </div>
                    </div>

                    <div className="ac-subject-card">
                        <div className="ac-subject-icon">
                            <FaLaptop />
                        </div>
                        <h3>Marketing Digital</h3>
                        <p>Stratégies digitales, réseaux sociaux, e-commerce et analytics</p>
                        <div className="ac-subject-levels">
                            <span className="ac-level-tag">M1</span>
                            <span className="ac-level-tag">M2</span>
                        </div>
                    </div>

                    <div className="ac-subject-card">
                        <div className="ac-subject-icon">
                            <FaSearch />
                        </div>
                        <h3>Études de Marché</h3>
                        <p>Méthodologie de recherche, analyse quantitative et qualitative</p>
                        <div className="ac-subject-levels">
                            <span className="ac-level-tag">L3</span>
                            <span className="ac-level-tag">M1</span>
                        </div>
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
                            <li><FaBrain /> Comportement du consommateur digital</li>
                            <li><FaUsers /> Influence des réseaux sociaux</li>
                            <li><FaChartLine /> Marketing expérientiel</li>
                            <li><FaSearch /> Neuromarketing</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="ac-contact-section">
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
                                        <p>prenom.nom@univ.ma</p>
                                    </div>
                                </div>
                                
                                <div className="ac-contact-item">
                                    <FaPhone />
                                    <div>
                                        <strong>Téléphone</strong>
                                        <p>+212 (0)123456789</p>
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
