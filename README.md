# JobTracker - Suivi de Candidatures & Préparation aux Entretiens

Application web locale pour gérer vos candidatures et préparer vos entretiens d'embauche.

## Fonctionnalités

### 📋 Gestion des offres d'emploi
- Ajout/suppression d'offres avec description complète
- Qualification par statut : Postulé, Entretien téléphonique, 1er/2ème/3ème entretien
- Archivage des offres rejetées ou terminées
- Filtrage par statut

### 📄 Gestion du CV
- Stockage de votre CV initial (profil, compétences, expérience, formation)
- Modification à tout moment
- **Régénération automatique** du contenu IA quand le CV est mis à jour

### 🤖 Contenu généré par IA (sans API externe)
Pour chaque offre, l'application génère automatiquement :

1. **Guide d'entretien personnalisé**
   - Introduction contextualisée
   - Points clés à préparer
   - Recherche entreprise recommandée
   - Alignement avec vos compétences CV

2. **Leçons par compétence**
   - Détection automatique des compétences techniques et soft skills
   - Contenu pédagogique pour chaque compétence
   - Indication si vous maîtrisez déjà (basé sur votre CV)

3. **Questions/Réponses personnalisées**
   - Questions classiques adaptées à l'entreprise
   - Questions techniques basées sur les compétences requises
   - Questions comportementales basées sur les soft skills détectées

### 🎭 Simulateur d'entretien
- Mode entraînement avec 5 questions progressives
- Feedback intelligent basé sur :
  - Longueur et structure de la réponse
  - Présence de chiffres concrets
  - Exemples concrets
  - Personnalisation entreprise
  - Alignement avec votre CV
- Score et commentaires d'amélioration

### 📝 Prise de notes
- Notes spécifiques à chaque candidature
- Sauvegarde automatique

## Installation

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Build pour production
npm run build

# Preview de la production
npm run preview
```

## Stockage des données

Les données sont stockées localement dans le **localStorage** du navigateur :
- Aucune donnée n'est envoyée vers un serveur
- Persistance entre les sessions
- Export/import possible via les DevTools

Clé de stockage : `jobTrackerData`

## Structure des données

```javascript
{
  cv: {
    profile: string,
    skills: string,
    experience: string,
    education: string
  },
  jobs: [{
    id: string,
    title: string,
    company: string,
    description: string,
    status: 'applique'|'telephone'|'premier'|'deuxieme'|'troisieme'|'archive',
    createdAt: ISO date,
    guide: { introduction, keyPoints, companyResearch },
    lessons: [{ topic, category, masteryLevel, content }],
    qa: [{ question, answer, type }],
    skills: string[]
  }],
  notes: { [jobId]: string }
}
```

## Comment fonctionne l'IA locale ?

L'application utilise un système de **templates intelligents** qui :

1. **Extraction de compétences** : Analyse la description pour identifier :
   - Compétences techniques (React, Python, AWS, etc.)
   - Soft skills (leadership, communication, etc.)
   - Méthodologies (Agile, Scrum, DevOps, etc.)

2. **Personnalisation CV** : Compare les compétences de l'offre avec votre CV pour :
   - Identifier les correspondances
   - Adapter les conseils de préparation
   - Suggérer des points forts à mettre en avant

3. **Génération contextuelle** : Crée du contenu unique pour chaque offre en utilisant :
   - Le nom de l'entreprise
   - L'intitulé du poste
   - Les compétences détectées
   - Votre profil CV

4. **Feedback simulateur** : Analyse vos réponses selon :
   - Critères quantitatifs (longueur, chiffres)
   - Critères qualitatifs (exemples, personnalisation)
   - Alignment avec votre profil

## Technologies

- React 18
- Vite
- Lucide React (icônes)
- CSS natif avec variables CSS
- localStorage pour le stockage

## Design UX/UI

Interface moderne et épurée avec :
- Dashboard deux colonnes (sidebar + contenu)
- Cartes avec ombres douces
- Badges de statut colorés
- Modales pour les formulaires
- Tabs pour organiser le contenu
- Responsive design

## Confidentialité

✅ Toutes les données restent sur votre machine
✅ Aucune connexion API externe
✅ Aucun tracking ni analytics
✅ Code open-source vérifiable
