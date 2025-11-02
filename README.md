# ENCG Barakat - Plateforme de Partage de Ressources Pédagogiques

Une plateforme web dédiée au **Professeur Barakat** de l'École Nationale de Commerce et de Gestion (ENCG) pour partager ses cours de marketing et TDs avec ses étudiants de 3ème, 4ème et 5ème année.

## 🎯 Qu'est-ce que cette plateforme ?

Cette application permet au **Professeur Barakat** de :
- **Publier ses cours** de Marketing Fondamental, Comportement du Consommateur, Marketing Digital et Études de Marché
- **Partager des TDs** et exercices pratiques avec corrections
- **Gérer l'accès** de ses 200+ étudiants aux ressources
- **Organiser le contenu** par année d'étude (3ème, 4ème, 5ème)

Les **étudiants** peuvent :
- **Naviguer librement** dans tous les cours et TDs sans connexion
- **Prévisualiser les PDFs** directement dans le navigateur
- **Télécharger les fichiers** après connexion
- **Filtrer par année** et type de document (PDF/PowerPoint)
- **Voir les derniers ajouts** sur la page d'accueil

## 🏫 Contexte Académique

### Matières Enseignées
- **Marketing Fondamental** (L2, L3) - Concepts de base, stratégies marketing, mix marketing
- **Comportement du Consommateur** (L3, M1) - Psychologie du consommateur, processus de décision
- **Marketing Digital** (M1, M2) - Stratégies digitales, réseaux sociaux, e-commerce
- **Études de Marché** (L3, M1) - Méthodologie de recherche, analyse quantitative

### Organisation par Années
- **3ème année** : Cours fondamentaux de marketing
- **4ème année** : Approfondissement et spécialisations
- **5ème année** : Marketing avancé et recherche

## ✨ Fonctionnalités Spécifiques

### 📚 Gestion des Cours
- **Upload par l'admin** : Le professeur peut ajouter des cours PDF/PowerPoint
- **Tri automatique** : Les fichiers sont classés par date d'ajout (plus récents en premier)
- **Métadonnées** : Chaque fichier a une année, une taille, une date d'ajout
- **Prévisualisation PDF** : Ouverture directe des PDFs dans le navigateur
- **Téléchargement PowerPoint** : Download direct des présentations

### 📝 Système de TDs
- **Exercices pratiques** : TDs avec énoncés et corrections
- **Même interface** que les cours avec filtrage par année
- **Types de fichiers** : PDF pour les énoncés, PowerPoint pour les corrections

### 👥 Gestion des Étudiants
- **Comptes étudiants** : Création par l'administrateur uniquement
- **Statut actif/inactif** : Contrôle d'accès granulaire
- **Pas d'auto-inscription** : Sécurité renforcée
- **Rôles définis** : Étudiant (accès ressources) vs Admin (gestion complète)

### 🏠 Page d'Accueil Dynamique
- **Aperçus récents** : 3 derniers cours et TDs ajoutés
- **Carrousel interactif** : Présentation du professeur et de la plateforme
- **Navigation rapide** : Accès direct aux sections cours/TDs
- **Dates réelles** : Affichage des vraies dates d'ajout (pas toujours "hier")

### 🔐 Sécurité Académique
- **Connexion obligatoire** pour télécharger (pas pour consulter)
- **Protection anti-bot** : Cloudflare Turnstile sur la connexion
- **Rate limiting** : Protection contre les tentatives de connexion multiples
- **Validation stricte** : Sanitisation de tous les inputs utilisateur

## 🛠 Architecture Technique

### Frontend React
```
src/components/
├── home.jsx           # Page d'accueil avec aperçus récents
├── cours.jsx          # Navigation des cours par année avec filtres
├── td.jsx             # Navigation des TDs par année avec filtres
├── about-contact.jsx  # Informations sur le professeur
├── login.jsx          # Connexion sécurisée avec Turnstile
├── dashboard.jsx      # Interface admin avec onglets
├── UserManager.jsx    # CRUD utilisateurs avec rôles
├── FileManager.jsx    # Upload/suppression fichiers par type
└── FileStats.jsx      # Statistiques temps réel (nb fichiers, taille)
```

### Backend Firebase
- **Realtime Database** : Stockage des utilisateurs et métadonnées
- **Storage** : Hébergement des fichiers PDF/PowerPoint
- **Authentication** : Gestion des sessions utilisateur
- **Security Rules** : Contrôle d'accès granulaire

### Fonctionnalités Uniques
- **Prévisualisation PDF intégrée** : Pas de téléchargement nécessaire pour consulter
- **Filtrage intelligent** : Par année (3ème/4ème/5ème) et type (PDF/PPT)
- **Statistiques en temps réel** : Nombre de fichiers et espace utilisé
- **Interface bilingue** : Français avec terminologie académique marocaine

## 🚀 Installation pour Développement

### Prérequis Spécifiques
- Node.js 18+ (pour Vite et React 19)
- Compte Firebase avec Realtime Database activé
- Compte Cloudflare pour Turnstile CAPTCHA
- Accès aux fichiers du Professeur Barakat

### Configuration Firebase
```bash
# 1. Créer un projet Firebase "encg-barakat"
# 2. Activer Authentication (Email/Password)
# 3. Créer Realtime Database avec ces règles :

{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() == 'admin'"
    },
    "files": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() == 'admin'"
    }
  }
}
```

### Variables d'Environnement
```env
# Firebase - Projet ENCG Barakat
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=encg-barakat.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://encg-barakat-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=encg-barakat
VITE_FIREBASE_STORAGE_BUCKET=encg-barakat.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Cloudflare Turnstile pour protection login
VITE_TURNSTILE_SITE_KEY=0x4AAA...
```

### Commandes de Développement
```bash
npm install                    # Installer les dépendances
npm run dev                   # Serveur de développement (port 5173)
npm run build                 # Build de production
npm run gen:cours             # Générer l'index des cours
npm run gen:td                # Générer l'index des TDs
```

## 📊 Utilisation Concrète

### Pour le Professeur Barakat
1. **Connexion admin** sur `/login`
2. **Accès dashboard** sur `/dashboard`
3. **Upload cours** : Onglet "Cours" → Sélectionner année → Upload PDF/PPT
4. **Gestion étudiants** : Onglet "Utilisateurs" → Créer comptes étudiants
5. **Statistiques** : Voir nombre de fichiers et espace utilisé en temps réel

### Pour les Étudiants
1. **Navigation libre** : Consulter `/cours` et `/td` sans connexion
2. **Filtrage** : Sélectionner son année (3ème/4ème/5ème)
3. **Prévisualisation** : Cliquer sur un PDF pour l'ouvrir
4. **Téléchargement** : Se connecter puis télécharger les fichiers
5. **Contact** : Utiliser `/a-propos#contact` pour contacter le professeur

## 🎓 Spécificités Pédagogiques

### Types de Contenus
- **Cours magistraux** : PDFs avec théorie et concepts
- **Présentations** : PowerPoints utilisés en amphithéâtre
- **TDs** : Exercices pratiques avec énoncés et corrections
- **Études de cas** : Applications concrètes des concepts marketing

### Organisation Académique
- **Progression pédagogique** : Du fondamental (3ème) au spécialisé (5ème)
- **Cohérence des contenus** : Alignement avec le programme ENCG
- **Mise à jour régulière** : Ajout de nouveaux contenus chaque semestre

## 🔧 Maintenance et Support

### Monitoring
- **FileStats.jsx** : Surveillance de l'espace disque utilisé
- **Logs Firebase** : Suivi des connexions et téléchargements
- **Notifications** : Alertes pour les erreurs d'upload/download

### Support Technique
- **Email** : Contact via la page À Propos
- **Documentation** : `FIREBASE_SETUP.md` pour la configuration
- **Sécurité** : `SECURITY_AUDIT.md` pour les bonnes pratiques

## 📈 Statistiques d'Usage

La plateforme suit :
- **Nombre total de fichiers** (cours + TDs)
- **Espace de stockage utilisé** (en MB/GB)
- **Répartition par type** (cours vs TDs)
- **Derniers ajouts** (affichés sur l'accueil)

## 🎯 Objectifs Pédagogiques

Cette plateforme vise à :
- **Centraliser** toutes les ressources du Professeur Barakat
- **Faciliter l'accès** des étudiants aux contenus pédagogiques
- **Moderniser** la distribution des cours à l'ENCG
- **Sécuriser** le partage de documents académiques
- **Optimiser** l'organisation par année d'étude

---

**Développé pour** : Professeur Barakat, ENCG  
**Étudiants concernés** : 200+ étudiants en marketing (3ème, 4ème, 5ème année)  
**Technologies** : React 19, Firebase, Cloudflare Turnstile  
**Statut** : En production active