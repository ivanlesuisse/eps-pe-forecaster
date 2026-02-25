# 🚀 Swiss Fintrack - Guide Complet d'Installation & Démarrage

## 📋 Avant de Commencer

### ✅ Vérifications Préalables
- [ ] Node.js 18+ installé (`node --version`)
- [ ] npm 9+ ou yarn (`npm --version`)
- [ ] Git installé (`git --version`)
- [ ] Un compte Clerk actif (déjà configuré ✓)
- [ ] Accès à PostgreSQL (local ou Supabase)

---

## 🔧 Étape 1: Configuration PostgreSQL

### Option A: PostgreSQL Local (Recommandé pour Dev)

**macOS (Homebrew)**
```bash
# Installer PostgreSQL
brew install postgresql@15

# Démarrer le service
brew services start postgresql@15

# Vérifier que c'est OK
pg_isready
# Output: accepting connections ✓

# Créer une base de données
createdb swissfintrack

# Vérifier
psql -l | grep swissfintrack
```

**Windows (PostgreSQL Installer)**
1. Télécharger: https://www.postgresql.org/download/windows/
2. Installer (note le mot de passe)
3. Vérifier: `pg_isready.exe`
4. Créer BDD: `createdb -U postgres swissfintrack`

**Linux (apt)**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer BDD
sudo -u postgres createdb swissfintrack
```

### Option B: Supabase Cloud (Recommandé pour Prod)

1. Aller sur https://supabase.com
2. Cliquer "Start your project"
3. Remplir infos (organisation, projet, région)
4. Attendre création (~2 min)
5. Aller à l'onglet "Settings" → "Database"
6. Copier la connection string

---

## 📝 Étape 2: Configuration Environnement

### A. Ouvrir le Fichier .env.local
```bash
cd swiss-fintrack
nano .env.local
# ou: code .env.local (si VS Code)
```

### B. Ajouter DATABASE_URL

**Si PostgreSQL Local:**
```env
DATABASE_URL="postgresql://localhost:5432/swissfintrack"
# Ou avec utilisateur/password:
DATABASE_URL="postgresql://user:password@localhost:5432/swissfintrack"
```

**Si Supabase:**
```env
DATABASE_URL="postgresql://[postres.user]:[password]@[project].supabase.co:5432/postgres?sslmode=require"
```

### C. Vérifier les Autres Variables

Le fichier devrait contenir:
```env
# Ces clés sont déjà configurées:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Vous avez ajouté:
DATABASE_URL="postgresql://..."
```

### D. Sauvegarder et Tester la Connexion

```bash
# Tester la connexion (si URL locale):
psql postgresql://localhost:5432/swissfintrack

# Si ça marche:
swissfintrack=> \q  # Exit

# Si ça ne marche pas, réessayer l'URL
```

---

## 📦 Étape 3: Installation Dépendances

```bash
# Depuis la racine du projet
cd swiss-fintrack

# Installer toutes les dépendances
npm install

# Vérifier installation (optionnel)
npm list | head -20
```

**Résultat attendu:**
```
├── @clerk/nextjs@6.38.1
├── @prisma/client@7.4.1
├── next@16.1.6
├── prisma@7.4.1
├── react@19.2.3
├── react-dom@19.2.3
├── recharts@3.7.0
└── lucide-react@0.575.0
```

---

## 🗄️ Étape 4: Initialiser la Base de Données

### A. Appliquer les Migrations
```bash
# Créer les tables PostgreSQL depuis le schema.prisma
npx prisma migrate dev --name init

# Vous verrez:
# ✔ Enter a name for the new migration... init
# ✔ Your database is now in sync with your schema.
# ✔ Generated Prisma Client to ./node_modules/@prisma/client
```

**Qu'est-ce qui s'est passé:**
- ✓ Tables créées (User, Asset, Transaction)
- ✓ Indexes créés pour performance
- ✓ Enums configurés (AssetType, TransactionType)
- ✓ Relations 1:N établies
- ✓ Client Prisma généré

### B. Vérifier que tout est OK

```bash
# Ouvrir l'interface Prisma Studio (optionnel)
npx prisma studio

# Une interface web s'ouvrira sur http://localhost:5555
# Vous verrez les tables vides (c'est normal)
# Fermer avec Ctrl+C
```

---

## 🚀 Étape 5: Démarrer l'Application

### A. Lancer le Serveur Dev
```bash
npm run dev

# Résultat attendu:
# ▲ Next.js 16.1.6
#   - Local:        http://localhost:3000
#   - Environments: .env.local
```

### B. Ouvrir dans le Navigateur
1. Aller sur: **http://localhost:3000**
2. La page devrait charger sans erreurs
3. Voir le bouton "Sign In"

### C. Se Connecter
1. Cliquer "Sign In" (en haut à droite)
2. Suivre les instructions Clerk
3. Se connexter ou créer un compte
4. Être redirigé vers `/dashboard`

---

## ✅ Étape 6: Tester le Workflow Complet

### Test 1: Ajouter un Compte Bancaire

1. **Naviguer:**
   - Depuis le dashboard, cliquer "Compléter mon patrimoine"
   - Ou aller directement sur `/dashboard/add`

2. **Sélectionner Catégorie:**
   - Cliquer sur "Comptes bancaires" (Landmark 🏦)

3. **Remplir le Formulaire:**
   - Banque: UBS
   - Type: "Compte courant"
   - Nom: "Mon compte principal"
   - Solde: 10000

4. **Soumettre:**
   - Cliquer "Ajouter"
   - Être redirigé vers `/dashboard`

5. **Vérifier:**
   - Voir le nouvel actif dans "Mon Portefeuille"
   - Valeur affichée: CHF 10'000
   - Icône bancaire visible

### Test 2: Ajouter une Crypto

1. Cliquer à nouveau "Compléter mon patrimoine"
2. Sélectionner "Cryptomonnaies"
3. Remplir:
   - Plateforme: Binance
   - Crypto: Bitcoin (BTC)
   - Quantité: 0.1
   - Prix d'achat: 40'000 CHF
   - Prix actuel: 45'000 CHF
4. Cliquer "Ajouter"
5. Voir dans le portfolio:
   - Bitcoin
   - Valeur: CHF 4'500
   - Gain: CHF +500 (vert)

### Test 3: Vérifier P&L

1. Sur le dashboard, voir "Mon Portefeuille"
2. Vérifier les gains/pertes:
   - Assez avec prix identique: pas de gain
   - Bitcoin avec +5000: affiche +500 CHF gain
3. Supprimer le Bitcoin:
   - Cliquer l'icône🗑️
   - Confirmer
   - L'actif disparaît

---

## 🐛 Troubleshooting

### ❌ "DATABASE_URL not found"

**Problème:** Prisma ne trouve pas la variable d'environnement

**Solutions:**
```bash
# 1. Vérifier le fichier existe
ls -la .env.local
# Voir: -rw-r--r-- .env.local

# 2. Vérifier le contenu
cat .env.local | grep DATABASE_URL
# Voir: DATABASE_URL="postgresql://..."

# 3. Redémarrer le serveur
npm run dev
# Ctrl+C puis rerun
```

### ❌ "Connection refused / ECONNREFUSED"

**Problème:** PostgreSQL n'est pas accessible

**Solutions:**
```bash
# 1. Vérifier PostgreSQL est lancé
pg_isready
# Résultat: accepting connections ✓

# 2. Si sur macOS:
brew services start postgresql@15

# 3. Si URL est incorrecte:
# Tester: psql postgresql://localhost:5432/swissfintrack
# Si ça marche, le problème est ailleurs

# 4. Verifier le path dans .env.local
```

### ❌ "PrismaClientInitializationError"

**Problème:** Le schéma Prisma n'est pas en sync avec la BDD

**Solutions:**
```bash
# 1. Vérifier la migration a bien tourné
npx prisma migrate status

# 2. Si migration manquante:
npx prisma migrate dev --name init

# 3. Régénérer le client
npx prisma generate

# 4. Redémarrer
npm run dev
```

### ❌ "User does not have CONNECT privilege"

**Problème:** L'utilisateur PostgreSQL n'a pas les droits

**Solutions:**
```bash
# Depuis PostgreSQL:
psql -U postgres

# Donner les droits:
CREATE DATABASE swissfintrack;
GRANT ALL PRIVILEGES ON DATABASE swissfintrack TO postgres;

# Ou créer un nouvel utilisateur:
CREATE USER fintrack_user WITH PASSWORD 'password';
CREATE DATABASE swissfintrack OWNER fintrack_user;
```

### ❌ "Cannot find module '@/lib/prisma'"

**Problème:** Alias TypeScript ne fonctionne pas

**Solutions:**
```bash
# 1. Vérifier tsconfig.json existe
ls tsconfig.json

# 2. Regénérer:
npm install

# 3. Redémarrer VS Code
# Fermer et rouvrir
```

### ❌ "Clerk authentication failed"

**Problème:** Les clés Clerk ne sont pas valides

**Solutions:**
```bash
# 1. Vérifier les clés dans .env.local
cat .env.local | grep CLERK

# 2. Si manquantes, aller sur:
# https://dashboard.clerk.com/last-active

# 3. Copier les bonnes clés
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# CLERK_SECRET_KEY

# 4. Redémarrer le serveur
```

---

## 💾 Commandes Utiles

```bash
# Démarrage
npm run dev                 # Mode développement

# Base de données
npx prisma migrate dev      # Appliquer migrations
npx prisma migrate status   # Voir statut
npx prisma studio          # Interface web BDD
npx prisma generate        # Régénérer client

# Build
npm run build              # Build production
npm start                  # Lancer production

# Nettoyage
npm run lint               # Checker ESLint
rm -rf .next node_modules  # Full clean
npm install                # Réinstaller tout

# PostgreSQL (local)
createdb swissfintrack     # Créer BDD
psql swissfintrack         # Connecter
\dt                        # List tables
\q                         # Exit
```

---

## 🎯 Points Clés à Retenir

| Point | Info |
|-------|------|
| **DATABASE_URL** | OBLIGATOIRE pour fonctionner |
| **Migrations** | À appliquer une seule fois (npx prisma migrate dev) |
| **Serveur Dev** | Tourne sur http://localhost:3000 |
| **Logs Prisma** | export PRISMA_QUERY_ENGINE_LOG=true |
| **Reset Complet** | npx prisma migrate reset (⚠️ supprime tout) |

---

## ✨ Prochaines Étapes

Une fois tout en place:

1. **Tester l'Application**
   - Ajouter plusieurs actifs
   - Vérifier les calculs P&L
   - Éditer/Supprimer des actifs

2. **Compréhension du Code**
   - Explorer src/app/api/assets/route.ts
   - Voir src/lib/calculations.ts
   - Lire IMPLEMENTATION.md

3. **Personnaliser**
   - Ajouter votre logo
   - Changer les couleurs
   - Modifier les institutions bancaires

4. **Déployer**
   - Créer compte Vercel
   - Connecter le repo Git
   - Passer DATABASE_URL en prod

---

## 🆘 Si ça ne Marche Toujours Pas

1. **Vérifier Tous les Prérequis**
   - Node 18+?
   - PostgreSQL accessible?
   - DATABASE_URL dans .env.local?

2. **Consulter la Doc**
   - IMPLEMENTATION.md (architecture)
   - QUICKSTART.md (démarrage rapide)
   - Ce guide (détails complets)

3. **Logs**
   - Regarder la console du serveur dev
   - Ouvrir DevTools dans le navigateur
   - Utiliser Prisma Studio pour BDD

4. **Réinitialiser**
   ```bash
   # Hard reset
   rm -rf node_modules .next .prisma
   rm .env.local
   npm install
   # Reconfigurer DATABASE_URL
   npx prisma migrate dev --name init
   npm run dev
   ```

---

## 🎉 Vous Êtes Prêt!

Une fois ces étapes complétées, vous avez:
- ✅ PostgreSQL configuré
- ✅ Application lancée localement
- ✅ Authification Clerk fonctionnelle
- ✅ Capacité à ajouter des actifs
- ✅ Dashboard avec P&L calculé

**Bienvenue sur Swiss Fintrack! 🚀**

---

**Questions?** Consultez QUICKSTART.md ou IMPLEMENTATION.md
