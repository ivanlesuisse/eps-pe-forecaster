# Projet : Swiss FinTrack

## Concept
Agrégateur de patrimoine complet (type Finary) pour le marché suisse et international.

## 1. Stack Technique Recommandée
*   **Frontend** : Next.js (pour web).
*   **Backend** : Node.js avec Express ou Python (FastAPI).
*   **Base de données** : PostgreSQL (via Supabase) pour stocker les actifs et les utilisateurs.
*   **Authentification** : Clerk ou Supabase Auth.
*   **APIs Finance** : Plaid (comptes bancaires), Yahoo Finance API ou Alpha Vantage (stocks/crypto).

## 2. Structure des Fonctionnalités (Le Plan d'Action)

### Phase 1 : Système d'Authentification
*   Création de compte (Email, Google, Apple).
*   Profil utilisateur avec devise par défaut (CHF).

### Phase 2 : Gestion des Avoirs (Le Cœur de l'App)
L'utilisateur doit pouvoir ajouter des actifs de trois manières :
1.  **Connexion API** : Intégration de Plaid ou GoCardless pour synchroniser les comptes bancaires et plateformes de courtage.
2.  **Ajout Manuel (Actifs Exotiques)** : Formulaire pour entrer des montres, immobilier, art, private equity (Nom, Valeur d'achat, Date).
3.  **Scanner de Screenshots (OCR)** : Utiliser une API comme Google Vision ou OpenAI GPT-4o pour analyser une capture d'écran d'un relevé bancaire et extraire automatiquement les montants.

### Phase 3 : Base de Données et Mise à Jour
*   **Schéma de base de données** : Users, Assets, Transactions, Prices_History.
*   **Système de mise à jour** : Un "cron job" qui récupère les prix actuels (via API Finance) à chaque connexion pour calculer la plus-value/moins-value.

### Phase 4 : Dashboard et Visualisation
*   Affichage du patrimoine total.
*   Graphique de performance (évolution dans le temps).
*   Répartition par catégorie (Action, Cash, Crypto, Exotique).

## 3. Prompts à donner à Gemini App Coder (Étape par Étape)

### Prompt 1 (Initialisation) :
"Je veux créer une application nommée 'Swiss FinTrack'. C'est un agrégateur de patrimoine. Peux-tu générer la structure de base du projet en utilisant Next.js et Tailwind CSS ? Prépare le dossier components et models pour la base de données."

### Prompt 2 (Base de données) :
"Crée un schéma Prisma (PostgreSQL) pour gérer des utilisateurs et leurs actifs. Chaque actif doit avoir un type (Banque, Crypto, Immobilier, Exotique), une valeur initiale et une quantité."

### Prompt 3 (Logique d'ajout) :
"Code-moi un formulaire pour ajouter manuellement un 'Investissement Exotique'. L'utilisateur doit pouvoir entrer le nom, la valeur estimée et la catégorie."

### Prompt 4 (L'Intelligence Artificielle) :
"Aide-moi à intégrer une fonction où l'utilisateur upload une image (screenshot). Utilise une API d'OCR pour lire le texte et suggérer automatiquement le montant à ajouter dans la base de données."

## Conseils pour réussir :
*   **Commence petit (MVP)** : Fais d'abord fonctionner l'ajout manuel et le dashboard avant de t'attaquer aux connexions bancaires réelles (qui sont plus difficiles à configurer).
*   **Sécurité** : Puisque tu manipules des données financières, demande à Gemini d'implémenter un chiffrement des données en base.
*   **Spécificité Suisse** : N'oublie pas de préciser à l'IA que la devise principale est le CHF.
