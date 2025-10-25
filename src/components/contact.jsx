import './styles/contact.css'

export default function Contact(){
    return(
        <div className="contact-container">
            {/* Header */}
            <section className="contact-header">
                <div className="header-content">
                    <h1 className="page-title">Contactez-moi</h1>
                    <p className="page-subtitle">
                        Pour toute question concernant les cours, les TDs ou pour prendre rendez-vous
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <div className="contact-main">
                <div className="contact-grid">
                    {/* Contact Form */}
                    <div className="form-section">
                        <div className="form-card">
                            <div className="form-header">
                                <h2>Envoyez un message</h2>
                                <p>Je vous répondrai dans les plus brefs délais</p>
                            </div>
                            
                            <form className="contact-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Prénom</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            placeholder="Votre prénom"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nom</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            placeholder="Votre nom"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Email étudiant</label>
                                    <input 
                                        type="email" 
                                        className="form-input" 
                                        placeholder="prenom.nom@etudiant.univ.fr"
                                        required
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Niveau d'étude</label>
                                        <select className="form-select" required>
                                            <option value="">selectionnez votre niveau</option>
                                            <option value="1an">1ère année</option>
                                            <option value="2an">2ème année</option>
                                            <option value="3an">3ème année</option>
                                            <option value="4an">4éme année</option>
                                            <option value="5an">5ème année</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sujet</label>
                                        <select className="form-select" required>
                                            <option value="">Type de demande</option>
                                            <option value="cours">Question sur un cours</option>
                                            <option value="td">Aide pour un TD</option>
                                            <option value="autre">Autre</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea 
                                        className="form-textarea" 
                                        rows="5"
                                        placeholder="Décrivez votre question ou demande..."
                                        required
                                    ></textarea>
                                </div>
                                
                                <button type="submit" className="submit-btn">
                                    <i className="fas fa-paper-plane"></i>
                                    Envoyer le message
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="info-section">
                        {/* Contact Details */}
                        <div className="info-card">
                            <div className="card-header">
                                <div className="card-icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <h3>Coordonnées</h3>
                            </div>
                            <div className="card-content">
                                <div className="contact-item">
                                    <i className="fas fa-envelope"></i>
                                    <div>
                                        <strong>Email professionnel</strong>
                                        <p>prenom.nom@univ.fr</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <div>
                                        <strong>Bureau</strong>
                                        <p>Bâtiment [Nom], Bureau [Numéro]<br/>
                                        Campus Universitaire<br/>
                                        [Code Postal] [Ville]</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="fas fa-phone"></i>
                                    <div>
                                        <strong>Téléphone</strong>
                                        <p>+33 (0)1 23 45 67 89<br/>
                                        <small>Heures de bureau uniquement</small></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="info-card">
                            <div className="card-header">
                                <div className="card-icon">
                                    <i className="fas fa-download"></i>
                                </div>
                                <h3>Ressources utiles</h3>
                            </div>
                            <div className="card-content">
                                <div className="resource-links">
                                    <a href="#" className="resource-link">
                                        <i className="fas fa-file-pdf"></i>
                                        <span>Planning des cours</span>
                                        <i className="fas fa-external-link-alt"></i>
                                    </a>
                                    <a href="#" className="resource-link">
                                        <i className="fas fa-book"></i>
                                        <span>Bibliographie recommandée</span>
                                        <i className="fas fa-external-link-alt"></i>
                                    </a>
                                    <a href="#" className="resource-link">
                                        <i className="fas fa-calendar"></i>
                                        <span>Calendrier des examens</span>
                                        <i className="fas fa-external-link-alt"></i>
                                    </a>
                                    <a href="#" className="resource-link">
                                        <i className="fas fa-question-circle"></i>
                                        <span>FAQ étudiants</span>
                                        <i className="fas fa-external-link-alt"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}