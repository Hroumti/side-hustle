import './styles/a-propos.css'

export default function Apropos(){
    return(
        <div className="apropos-container">
            {/* Header Section */}
            <section className="herooo-section">
                <div className="herooo-content">
                    <div className="profile-card">
                        <div className="profile-image">
                            <i className="fas fa-user-tie"></i>
                        </div>
                        <div className="profile-info">
                            <h1 className="professor-name">Professeur [Votre Nom]</h1>
                            <p className="professor-title">Enseignant-Chercheur en Marketing</p>
                            <p className="university">Université [Nom de l'Université]</p>
                        </div>
                    </div>
                    
                    <div className="intro-text">
                        <h2>Bienvenue sur mon espace pédagogique</h2>
                        <p>
                            Cet espace est dédié au partage de ressources pédagogiques avec mes étudiants. 
                            Vous y trouverez l'ensemble de mes cours, travaux dirigés, et supports de formation 
                            en marketing et comportement du consommateur.
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-book"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">12</div>
                            <div className="stat-label">Cours disponibles</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-users"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">200+</div>
                            <div className="stat-label">Étudiants</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-file-alt"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">25</div>
                            <div className="stat-label">TDs & Exercices</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-calendar"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">5</div>
                            <div className="stat-label">Années d'expérience</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Teaching Areas */}
            <section className="teaching-section">
                <div className="section-header">
                    <h2>Domaines d'enseignement</h2>
                    <p>Les matières que j'enseigne et pour lesquelles je propose des ressources</p>
                </div>
                
                <div className="subjects-grid">
                    <div className="subject-card">
                        <div className="subject-icon">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h3>Marketing Fondamental</h3>
                        <p>Concepts de base, stratégies marketing, mix marketing et analyse de marché</p>
                        <div className="subject-levels">
                            <span className="level-tag">L2</span>
                            <span className="level-tag">L3</span>
                        </div>
                    </div>

                    <div className="subject-card">
                        <div className="subject-icon">
                            <i className="fas fa-brain"></i>
                        </div>
                        <h3>Comportement du Consommateur</h3>
                        <p>Psychologie du consommateur, processus de décision et facteurs d'influence</p>
                        <div className="subject-levels">
                            <span className="level-tag">L3</span>
                            <span className="level-tag">M1</span>
                        </div>
                    </div>

                    <div className="subject-card">
                        <div className="subject-icon">
                            <i className="fas fa-laptop"></i>
                        </div>
                        <h3>Marketing Digital</h3>
                        <p>Stratégies digitales, réseaux sociaux, e-commerce et analytics</p>
                        <div className="subject-levels">
                            <span className="level-tag">M1</span>
                            <span className="level-tag">M2</span>
                        </div>
                    </div>

                    <div className="subject-card">
                        <div className="subject-icon">
                            <i className="fas fa-search"></i>
                        </div>
                        <h3>Études de Marché</h3>
                        <p>Méthodologie de recherche, analyse quantitative et qualitative</p>
                        <div className="subject-levels">
                            <span className="level-tag">L3</span>
                            <span className="level-tag">M1</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Academic Background */}
            <section className="background-section">
                <div className="background-content">
                    <div className="background-text">
                        <h2>Parcours académique</h2>
                        <div className="education-item">
                            <h4>Doctorat en Sciences de Gestion</h4>
                            <p>Spécialisation Marketing - Université [Nom] (2018-2022)</p>
                        </div>
                        <div className="education-item">
                            <h4>Master Recherche en Marketing</h4>
                            <p>Mention Très Bien - Université [Nom] (2016-2018)</p>
                        </div>
                        <div className="education-item">
                            <h4>Licence Économie-Gestion</h4>
                            <p>Parcours Marketing - Université [Nom] (2013-2016)</p>
                        </div>
                    </div>
                    
                    <div className="research-interests">
                        <h3>Intérêts de recherche</h3>
                        <ul>
                            <li>Comportement du consommateur digital</li>
                            <li>Influence des réseaux sociaux</li>
                            <li>Marketing expérientiel</li>
                            <li>Neuromarketing</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    )
}