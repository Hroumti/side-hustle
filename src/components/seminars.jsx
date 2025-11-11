import React, { useState, useEffect, useContext } from 'react'
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaExternalLinkAlt, FaUsers, FaGlobe } from 'react-icons/fa'
import { Context } from './context'
import './styles/seminars.css'

export default function Seminars() {
    const { role } = useContext(Context)
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Placeholder data - will be replaced with API call
        const placeholderEvents = [
            {
                id: 1,
                title: 'Conférence Internationale sur le Marketing Digital',
                description: 'Une conférence dédiée aux dernières tendances du marketing digital, l\'intelligence artificielle et l\'analyse des données. Rejoignez-nous pour découvrir les stratégies innovantes qui transforment le paysage marketing.',
                date: '2025-12-15',
                time: '09:00 - 17:00',
                location: 'ENCG Agadir',
                type: 'conference',
                link: 'https://example.com/conference-marketing-digital',
                capacity: 200,
                status: 'upcoming'
            },
            {
                id: 2,
                title: 'Séminaire: Comportement du Consommateur à l\'Ère Numérique',
                description: 'Un séminaire approfondi explorant les changements dans le comportement des consommateurs avec l\'avènement des technologies numériques et des réseaux sociaux.',
                date: '2025-11-20',
                time: '14:00 - 18:00',
                location: 'Salle de Conférence A',
                type: 'seminar',
                link: 'https://example.com/seminar-comportement',
                capacity: 80,
                status: 'upcoming'
            },
            {
                id: 3,
                title: 'Workshop: Stratégies de Marketing sur les Réseaux Sociaux',
                description: 'Atelier pratique sur la création et la mise en œuvre de stratégies marketing efficaces sur les principales plateformes de réseaux sociaux.',
                date: '2025-11-25',
                time: '10:00 - 13:00',
                location: 'Laboratoire Informatique',
                type: 'workshop',
                link: 'https://example.com/workshop-social-media',
                capacity: 40,
                status: 'upcoming'
            },
            {
                id: 4,
                title: 'Colloque: Innovation et Entrepreneuriat',
                description: 'Colloque réunissant chercheurs, entrepreneurs et étudiants pour discuter des dernières innovations en matière d\'entrepreneuriat et de création d\'entreprise.',
                date: '2025-10-10',
                time: '09:00 - 16:00',
                location: 'Amphithéâtre Principal',
                type: 'conference',
                link: 'https://example.com/colloque-innovation',
                capacity: 150,
                status: 'past'
            }
        ]

        setTimeout(() => {
            setEvents(placeholderEvents)
            setLoading(false)
        }, 500)
    }, [])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getEventTypeLabel = (type) => {
        const types = {
            conference: 'Conférence',
            seminar: 'Séminaire',
            workshop: 'Atelier'
        }
        return types[type] || type
    }

    const getEventTypeClass = (type) => {
        return `event-type-${type}`
    }

    const upcomingEvents = events.filter(e => e.status === 'upcoming')
    const pastEvents = events.filter(e => e.status === 'past')

    return (
        <div className="seminars-container">
            <section className="seminars-hero">
                <div className="seminars-hero-content">
                    <h1>Séminaires & Conférences</h1>
                    <p>Découvrez nos événements académiques, conférences et ateliers</p>
                </div>
            </section>

            <section className="seminars-content">
                {loading ? (
                    <div className="seminars-loading">
                        <div className="loading-spinner"></div>
                        <p>Chargement des événements...</p>
                    </div>
                ) : (
                    <>
                        {upcomingEvents.length > 0 && (
                            <div className="events-section">
                                <h2 className="section-title">Événements à venir</h2>
                                <div className="events-grid">
                                    {upcomingEvents.map(event => (
                                        <div key={event.id} className="event-card">
                                            <div className="event-header">
                                                <span className={`event-type ${getEventTypeClass(event.type)}`}>
                                                    {getEventTypeLabel(event.type)}
                                                </span>
                                                <span className="event-status upcoming">À venir</span>
                                            </div>
                                            
                                            <h3 className="event-title">{event.title}</h3>
                                            <p className="event-description">{event.description}</p>
                                            
                                            <div className="event-details">
                                                <div className="event-detail">
                                                    <FaCalendarAlt />
                                                    <span>{formatDate(event.date)}</span>
                                                </div>
                                                <div className="event-detail">
                                                    <FaClock />
                                                    <span>{event.time}</span>
                                                </div>
                                                <div className="event-detail">
                                                    <FaMapMarkerAlt />
                                                    <span>{event.location}</span>
                                                </div>
                                                <div className="event-detail">
                                                    <FaUsers />
                                                    <span>{event.capacity} places</span>
                                                </div>
                                            </div>
                                            
                                            <a 
                                                href={event.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="event-link"
                                            >
                                                <FaGlobe />
                                                En savoir plus
                                                <FaExternalLinkAlt />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {pastEvents.length > 0 && (
                            <div className="events-section">
                                <h2 className="section-title">Événements passés</h2>
                                <div className="events-grid">
                                    {pastEvents.map(event => (
                                        <div key={event.id} className="event-card past-event">
                                            <div className="event-header">
                                                <span className={`event-type ${getEventTypeClass(event.type)}`}>
                                                    {getEventTypeLabel(event.type)}
                                                </span>
                                                <span className="event-status past">Terminé</span>
                                            </div>
                                            
                                            <h3 className="event-title">{event.title}</h3>
                                            <p className="event-description">{event.description}</p>
                                            
                                            <div className="event-details">
                                                <div className="event-detail">
                                                    <FaCalendarAlt />
                                                    <span>{formatDate(event.date)}</span>
                                                </div>
                                                <div className="event-detail">
                                                    <FaMapMarkerAlt />
                                                    <span>{event.location}</span>
                                                </div>
                                            </div>
                                            
                                            <a 
                                                href={event.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="event-link"
                                            >
                                                <FaGlobe />
                                                Voir les détails
                                                <FaExternalLinkAlt />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {events.length === 0 && (
                            <div className="no-events">
                                <FaCalendarAlt />
                                <h3>Aucun événement disponible</h3>
                                <p>Les prochains événements seront annoncés bientôt</p>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    )
}
