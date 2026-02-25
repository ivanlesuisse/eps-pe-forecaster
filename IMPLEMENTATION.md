# Swiss Fintrack - Gestionnaire de Patrimoine

Une application Web3-ready pour Gérer votre patrimoine personnel en Suisse.

## 🚀 Fonctionnalités Implémentées

### ✅ Système d'Authentification
- Intégration avec **Clerk** pour l'authentification sécurisée
- Gestion des sessions utilisateur
- Support multi-comptes

### ✅ Gestion des Actifs (7 Catégories)

#### 1. **Comptes Bancaires** (Landmark 🏦)
- Ajout de comptes courants, livrets d'épargne, dépôts à terme
- Sélection d'institutions populaires (UBS, Raiffeisen, Revolut, Wise, etc.)
- Suivi du solde en temps réel

#### 2. **Investissements** (Briefcase 💼)
- Suivi des actions, fonds, obligations, ETF
- Intégration avec courtiers (VIAC, Interactive Brokers, DEGIRO, eToro)
- Calcul automatique des gains/pertes
- Suivi du prix d'achat vs prix actuel

#### 3. **Cryptomonnaies** (Coins 💰)
- Support des principales cryptos (Bitcoin, Ethereum, Solana, etc.)
- Intégration avec exchanges (Binance, Kraken, Coinbase, etc.)
- Gestion des adresses de portefeuille
- Suivi du prix en CHF

#### 4. **Immobilier** (Building2 🏠)
- Résidences principales, biens locatifs, commerciaux, terrains, SCPI
- Calcul de l'équité (valeur actuelle - crédit hypothécaire)
- Suivi de la valorisation du bien

#### 5. **Matières Premières** (Diamond 💎)
- Or, argent, platine et commodités
- Suivi par poids (grammes, onces, kg)
- Pureté et grade pour les métaux précieux
- Prix par unité configurable

#### 6. **Startups & PME** (Rocket 🚀)
- Investissements en capital-risque
- Stades de financement (Seed, Série A/B/C, Pré-IPO)
- Calcul de la valorisation basée sur % d'équité ou nombre d'actions
- Suivi ROI

#### 7. **Autres Actifs** (Wallet 👜)
- Voitures, bijoux, collections, œuvres d'art
- 4 méthodes d'évaluation (valeur de marché, coût, expertise, estimation personnelle)
- Description libre

### ✅ Calculs P&L (Profit & Loss)

Système de calcul complet incluant:
- **Gains/Pertes Non-Réalisés**: Différence entre valeur actuelle et coût
- **Pourcentage de Rendement**: % de gain/perte
- **Codification Couleur**: Vert (gain), Rouge (perte), Gris (neutre)
- **Allocation par Catégorie**: Distribution du portefeuille
- **Groupage par Type**: Analyse par type d'actif

### ✅ Interface Utilisateur

#### Dashboard Principal
- Graphe de la valeur totale du portefeuille (`Chart.tsx`)
- Distribution des actifs par catégorie (pie chart)
- Liste complète des actifs avec actions rapides

#### Flux "Ajouter un Actif"
1. Page de sélection des catégories
2. Formulaires spécifiques à chaque catégorie
3. Validation des saisies
4. Enregistrement en base de données

#### Gestion des Actifs
- Visualiser tous les actifs
- Éditer les valeurs
- Supprimer un actif
- Voir les gains/pertes en temps réel

## 🗄️ Architecture Base de Données

### Models Prisma

```typescript
// User
- id (UUID)
- clerkId (Unique, lié à Clerk)
- email
- baseCurrency (CHF par défaut)
- createdAt/updatedAt
- assets[] (relation 1:N)

// Asset
- id (UUID)
- userId (FK)
- name (ex: "Bitcoin" ou "Compte Principal")
- type (AssetType enum)
- category (string pour sous-catégories)
- institution (optional, pour banques/brokers)
- value (float, valeur actuelle en CHF)
- quantity (float, optionnel)
- buyingPrice (float, optionnel)
- currency (CHF par défaut)
- logo (optionnel, URL)
- createdAt/updatedAt
- transactions[] (relation 1:N)

// Transaction
- id (UUID)
- assetId (FK)
- type (BUY/SELL/DEPOSIT/WITHDRAWAL)
- amount (float)
- price (float)
- date (datetime)

// Enums
AssetType: BANKING | INVESTMENT | CRYPTO | REAL_ESTATE | COMMODITY | STARTUP | OTHER
TransactionType: BUY | SELL | DEPOSIT | WITHDRAWAL
```

## 📁 Structure des Fichiers

```
src/
├── app/
│   ├── api/
│   │   └── assets/
│   │       ├── route.ts          # GET/POST assets
│   │       └── [id]/
│   │           └── route.ts      # GET/PUT/DELETE individual asset
│   ├── dashboard/
│   │   ├── add/
│   │   │   ├── page.tsx          # Sélection catégorie
│   │   │   ├── banking.tsx       # Formulaire comptes bancaires
│   │   │   ├── investment.tsx    # Formulaire investissements
│   │   │   ├── crypto.tsx        # Formulaire crypto
│   │   │   ├── realestate.tsx    # Formulaire immobilier
│   │   │   ├── commodity.tsx     # Formulaire matières premières
│   │   │   ├── startup.tsx       # Formulaire startups
│   │   │   ├── other.tsx         # Formulaire autres actifs
│   │   │   └── [category]/
│   │   │       └── page.tsx      # Router dynamique
│   │   ├── layout.tsx
│   │   └── page.tsx              # Dashboard principal
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── AssetsList.tsx            # Composant affichage liste actifs
├── lib/
│   ├── calculations.ts           # Utilitaires P&L et métriques
│   └── prisma.ts                 # Configuration Prisma Client
└── models/
```

## 🔌 API Endpoints

### GET `/api/assets`
Récupère tous les actifs de l'utilisateur connecté
```json
Response: Asset[]
```

### POST `/api/assets`
Crée un nouvel actif
```json
Body: {
  "name": string,
  "type": AssetType,
  "category": string,
  "institution": string?,
  "value": number,
  "quantity": number?,
  "buyingPrice": number?,
  "currency": string (default: "CHF")
}
```

### GET `/api/assets/[id]`
Récupère un actif spécifique
```json
Response: Asset (with transactions)
```

### PUT `/api/assets/[id]`
Met à jour un actif
```json
Body: Partial<Asset>
```

### DELETE `/api/assets/[id]`
Supprime un actif (et ses transactions associées)

## 🚀 Getting Started

### 1. Configuration prerequisite

```bash
# Installer les dépendances
npm install

# Prisma est déjà installé via package.json
npm install @prisma/client prisma --save
```

### 2. Configuration Base de Données

```bash
# Remplacer le DATABASE_URL dans .env.local
# Pour PostgreSQL local:
DATABASE_URL="postgresql://user:password@localhost:5432/swissfintrack"

# Ou Supabase (Free tier):
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[database]?sslmode=require"
```

### 3. Initialiser la Base de Données

```bash
# Créer les tables
npx prisma migrate dev --name init

# Ou générer le client seulement (si la migration existe):
npx prisma generate
```

### 4. Démarrer l'App

```bash
# Mode développement
npm run dev

# Build production
npm run build
npm start
```

## 📊 Exemple d'Utilisation

1. Se connecter via Clerk
2. Aller sur `/dashboard/add`
3. Sélectionner une catégorie (ex: "Investissements")
4. Remplir le formulaire (ticker, quantité, prix d'achat, prix actuel)
5. Cliquer "Ajouter"
6. L'actif apparaît immédiatement sur le dashboard avec P&L calculé

## 🔐 Sécurité

- ✅ Authentification Clerk obligatoire sur tous les endpoints API
- ✅ Vérification du userId et du clerkId pour isolation des données
- ✅ Suppression en cascade des transactions lors de suppression d'actif
- ✅ Validation des entrées côté serveur

## 🎨 Palette de Couleurs

| Catégorie | Couleur | Hex |
|-----------|---------|-----|
| Bancaire | Émeraude | #10b981 |
| Investissement | Violet | #a855f7 |
| Crypto | Violet | #a855f7 |
| Immobilier | Bleu | #3b82f6 |
| Matières premières | Sky | #0ea5e9 |
| Startups | Orange | #f97316 |
| Autres | Zinc | #71717a |

## 📈 Prochaines Étapes (Roadmap)

- [ ] Historique des transactions avec graphes temporels
- [ ] Import OFX pour synchronisation bancaire
- [ ] Intégration Plaid/Powens pour sync automatique
- [ ] Export PDF du portefeuille
- [ ] Alertes de seuil de valeur
- [ ] Notifications en temps réel
- [ ] Mode sombre/clair amélioré
- [ ] Support multi-devises
- [ ] Backtest de portfolio
- [ ] Allocation optimale suggérée

## 📝 Notes Importantes

1. **DATABASE_URL est OBLIGATOIRE** pour que l'app fonctionne
2. Clerk doit être configuré avec un domaine valide
3. Prisma sera exécuté à la génération du build
4. Les fichiers `.tsx` utilisent `"use client"` pour Next.js 14+

## 📧 Support

Pour toute question ou rapport de bogue, consultez la documentat

ion Prisma et Next.js.

---

**Version**: 0.1.0  
**Dernière mise à jour**: 2024  
**Statut**: En développement active 🚀
