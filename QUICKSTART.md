# 🚀 Quick Start Guide - Swiss Fintrack

## 5 Minutes pour Démarrer

### 1️⃣ Prérequis
- Node.js 18+ installé
- PostgreSQL disponible (local ou Supabase)
- Code source cloné

### 2️⃣ Installation Dépendances
```bash
cd swiss-fintrack
npm install
```

### 3️⃣ Configuration Base de Données

#### Option A: PostgreSQL Local
```bash
# Dans .env.local, remplacer:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/swissfintrack"

# Créer la BDD localement:
createdb swissfintrack
```

#### Option B: Supabase (Recommandé)
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet (free tier)
3. Copier la connection string
4. Ajouter dans `.env.local`:
```
DATABASE_URL="postgresql://[postgres.user]:[password]@[project].supabase.co:5432/postgres?sslmode=require"
```

### 4️⃣ Initialiser la Base de Données
```bash
npx prisma migrate dev --name init
```

Cela va:
- Créer les tables dans PostgreSQL
- Générer le client Prisma
- Préparer la BDD pour l'app

### 5️⃣ Démarrer l'Application
```bash
npm run dev
```

L'app sera disponible sur **http://localhost:3000**

---

## 🎯 Premiers Pas dans l'Application

### Se Connecter
1. Aller sur http://localhost:3000
2. Cliquer "Sign In"
3. Se connecter avec Clerk (live account)

### Ajouter un Actif
1. Cliquer sur "Compléter mon patrimoine" ou "Ajouter un actif"
2. Sélectionner une catégorie (ex: "Comptes bancaires")
3. Remplir le formulaire
4. Cliquer "Ajouter"
5. L'actif apparaît immédiatement sur le dashboard

### Voir le Portfolio
- Dashboard affiche tous les actifs
- Colore vert/rouge selon gains/pertes
- Affiche valeur totale et détails

---

## 🔍 Troubleshooting

### ❌ "DATABASE_URL not found"
**Solution**: Ajouter `DATABASE_URL` dans `.env.local` et redémarrer

### ❌ "Prisma client not generated"
**Solution**: Exécuter `npx prisma generate`

### ❌ "Connection refused"
**Solution**: Vérifier que PostgreSQL est running
```bash
# macOS/Linux:
pg_isready

# Windows:
pg_isready.exe
```

### ❌ "Erreur lors de création d'actif"
**Solution**: 
1. Vérifier que la BDD est accessible
2. Vérifier que les migrations sont appliquées
3. Voir les logs en console

---

## 📚 Documentation Complète

- **IMPLEMENTATION.md**: Architecture et API détaillée
- **CHECKLIST.md**: Checklist complète des fonctionnalités
- **prisma/schema.prisma**: Modèle de données

---

## 🌐 Stack Technique

- **Frontend**: Next.js 16 + React 19
- **DB**: PostgreSQL + Prisma ORM
- **Auth**: Clerk
- **UI**: Tailwind CSS + Lucide Icons
- **Charts**: Recharts

---

## 💡 Tips & Tricks

### Voir les Logs Prisma
```bash
export PRISMA_QUERY_ENGINE_LOG=true
npm run dev
```

### Reset la BDD Complètement
```bash
npx prisma migrate reset
# ⚠️ Attention: Supprime TOUS les données
```

### Vérifier la BDD
```bash
npx prisma studio
# Ouvre une interface web pour explorer la BDD
```

### Générer des Migrations
```bash
# Après modification du schema.prisma:
npx prisma migrate dev --name my_change_name
```

---

## 🎨 Portfolio de Démo

Exemple d'actifs à ajouter pour tester:

**Comptes Bancaires**
- Compte Principal (UBS): 50,000 CHF

**Investissements**
- ETF World (VWRL): 10 x 95 CHF = 950 CHF

**Cryptomonnaies**
- Bitcoin: 0.5 BTC @ 42,000 CHF = 21,000 CHF

**Immobilier**
- Maison: 500,000 CHF valeur actuelle

**Total Portfolio**: 571,950 CHF

---

## 🆘 Besoin d'Aide?

### Documentation Officielle
- Prisma: https://www.prisma.io
- Next.js: https://nextjs.org
- Clerk: https://clerk.com/docs

### Communauté
- GitHub Issues de ce projet
- Stack Overflow avec tags `prisma`, `nextjs`
- Discord Prisma: https://pris.ly/discord

---

## ✅ Checklist Avant Prod

- [ ] DATABASE_URL configurée
- [ ] Migrations appliquées  
- [ ] Clerk keys valides
- [ ] Tests manuels effectués
- [ ] Erreurs console résolues
- [ ] Performance testée
- [ ] Backups BDD configurés

---

**Bon développement! 🚀**
