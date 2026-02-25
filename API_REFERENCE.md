# Swiss Fintrack - Technical Reference Guide

## 📚 API Reference

### Base URL
```
Local Development: http://localhost:3000
Production: https://your-domain.com
```

### Authentication
All endpoints require Clerk authentication via Next.js middleware.
```
Header: Cookie (Clerk session)
```

---

## 📌 Endpoints

### 1. POST /api/assets
**Create a new asset**

```http
POST /api/assets
Content-Type: application/json
Authorization: Clerk Session

{
  "name": "Bitcoin",
  "type": "CRYPTO",
  "category": "bitcoin",
  "institution": "binance",
  "value": 45000,
  "quantity": 0.1,
  "buyingPrice": 40000,
  "currency": "CHF",
  "logo": "https://..."
}
```

**Response (201):**
```json
{
  "id": "uuid-here",
  "userId": "uuid-here",
  "name": "Bitcoin",
  "type": "CRYPTO",
  "category": "bitcoin",
  "institution": "binance",
  "value": 45000,
  "quantity": 0.1,
  "buyingPrice": 40000,
  "currency": "CHF",
  "logo": null,
  "createdAt": "2024-02-18T10:30:00.000Z",
  "updatedAt": "2024-02-18T10:30:00.000Z"
}
```

**Error (400):**
```json
{
  "error": "Missing required fields"
}
```

**Error (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### 2. GET /api/assets
**Get all assets for current user**

```http
GET /api/assets
Authorization: Clerk Session
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Bitcoin",
    "type": "CRYPTO",
    "value": 45000,
    "quantity": 0.1,
    "buyingPrice": 40000,
    "currency": "CHF",
    "createdAt": "2024-02-18T10:30:00Z",
    "transactions": []
  },
  {
    "id": "uuid2",
    "userId": "uuid",
    "name": "UBS Account",
    "type": "BANKING",
    "value": 10000,
    "quantity": null,
    "buyingPrice": null,
    "currency": "CHF",
    "createdAt": "2024-02-18T11:00:00Z",
    "transactions": []
  }
]
```

**Error (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### 3. GET /api/assets/[id]
**Get specific asset with transactions**

```http
GET /api/assets/asset-uuid-here
Authorization: Clerk Session
```

**Response (200):**
```json
{
  "id": "asset-uuid",
  "userId": "user-uuid",
  "name": "Bitcoin",
  "type": "CRYPTO",
  "category": "bitcoin",
  "institution": "binance",
  "value": 45000,
  "quantity": 0.1,
  "buyingPrice": 40000,
  "currency": "CHF",
  "logo": null,
  "createdAt": "2024-02-18T10:30:00Z",
  "updatedAt": "2024-02-18T10:30:00Z",
  "transactions": [
    {
      "id": "tx-uuid",
      "assetId": "asset-uuid",
      "type": "BUY",
      "amount": 4000,
      "price": 40000,
      "date": "2024-02-18T10:30:00Z"
    }
  ]
}
```

**Error (404):**
```json
{
  "error": "Asset not found"
}
```

---

### 4. PUT /api/assets/[id]
**Update asset**

```http
PUT /api/assets/asset-uuid-here
Content-Type: application/json
Authorization: Clerk Session

{
  "value": 48000,
  "buyingPrice": 41000
}
```

**Response (200):**
```json
{
  "id": "asset-uuid",
  "userId": "user-uuid",
  "name": "Bitcoin",
  "type": "CRYPTO",
  "value": 48000,
  "quantity": 0.1,
  "buyingPrice": 41000,
  "currency": "CHF",
  "updatedAt": "2024-02-18T11:00:00Z"
}
```

**Error (404):**
```json
{
  "error": "Asset not found"
}
```

---

### 5. DELETE /api/assets/[id]
**Delete asset (cascades transactions)**

```http
DELETE /api/assets/asset-uuid-here
Authorization: Clerk Session
```

**Response (200):**
```json
{
  "message": "Asset deleted successfully"
}
```

**Error (404):**
```json
{
  "error": "Asset not found"
}
```

---

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id            String   @id @default(uuid())
  clerkId       String   @unique
  email         String   @unique
  baseCurrency  String   @default("CHF")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  assets        Asset[]
}
```

**Fields:**
- `id`: UUID primary key
- `clerkId`: Unique Clerk user ID
- `email`: User email (unique)
- `baseCurrency`: Default currency (CHF)
- `assets`: Relation to assets (1:N)

---

### Asset Model
```prisma
model Asset {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  name          String
  type          AssetType
  category      String
  institution   String?
  value         Float
  quantity      Float?
  buyingPrice   Float?
  currency      String   @default("CHF")
  logo          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  transactions  Transaction[]
}
```

**Fields:**
- `id`: UUID primary key
- `userId`: Foreign key to User
- `name`: Asset name (e.g., "Bitcoin")
- `type`: AssetType enum (BANKING, INVESTMENT, etc.)
- `category`: Subcategory (e.g., "bitcoin")
- `institution`: Optional institution name
- `value`: Current total value (CHF)
- `quantity`: Optional quantity/amount
- `buyingPrice`: Optional average purchase price
- `currency`: Currency code (default CHF)
- `logo`: Optional logo URL
- `transactions`: Relation to transactions (1:N)

---

### Transaction Model
```prisma
model Transaction {
  id        String   @id @default(uuid())
  assetId   String
  asset     Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  type      TransactionType
  amount    Float
  price     Float
  date      DateTime @default(now())
}
```

**Fields:**
- `id`: UUID primary key
- `assetId`: Foreign key to Asset
- `type`: TransactionType enum (BUY, SELL, DEPOSIT, WITHDRAWAL)
- `amount`: Transaction amount
- `price`: Price per unit
- `date`: Transaction timestamp

---

### Enums

#### AssetType
```prisma
enum AssetType {
  BANKING
  INVESTMENT
  CRYPTO
  REAL_ESTATE
  COMMODITY
  STARTUP
  OTHER
}
```

#### TransactionType
```prisma
enum TransactionType {
  BUY
  SELL
  DEPOSIT
  WITHDRAWAL
}
```

---

## 📊 Database Queries (Prisma Examples)

### Get user with all assets
```typescript
const user = await prisma.user.findUnique({
  where: { clerkId: "user_123" },
  include: { assets: true }
});
```

### Get assets by type
```typescript
const cryptoAssets = await prisma.asset.findMany({
  where: {
    userId: "user-uuid",
    type: "CRYPTO"
  }
});
```

### Calculate total portfolio value
```typescript
const assets = await prisma.asset.findMany({
  where: { userId: "user-uuid" }
});

const total = assets.reduce((sum, asset) => sum + asset.value, 0);
```

### Get asset with transactions
```typescript
const asset = await prisma.asset.findUnique({
  where: { id: "asset-uuid" },
  include: { transactions: true }
});
```

### Delete asset (cascade)
```typescript
// Transactions deleted automatically due to onDelete: Cascade
await prisma.asset.delete({
  where: { id: "asset-uuid" }
});
```

---

## 🔐 Security Patterns

### User Verification
```typescript
// Always verify user ownership
const user = await prisma.user.findUnique({
  where: { clerkId: userId }
});

const asset = await prisma.asset.findFirst({
  where: {
    id: assetId,
    userId: user.id  // ← Verify ownership
  }
});

if (!asset) return Response 404;
```

### Input Validation
```typescript
if (!name || !type || !value) {
  return Response.json({ error: "Missing required fields" }, { status: 400 });
}
```

### Error Handling
```typescript
try {
  // DB operations
} catch (error) {
  console.error("Error:", error);
  return Response.json({ error: "Failed" }, { status: 500 });
}
```

---

## 📈 P&L Calculations

### Unrealized Gain
```typescript
gain = currentValue - (buyingPrice * quantity)
```

**Example:**
- Buying Price: 40,000 CHF
- Quantity: 0.1
- Current Value: 45,000 CHF
- **Gain = 45,000 - (40,000 × 0.1) = 41,000 CHF**

### Gain Percentage
```typescript
percentage = (gain / totalInvested) * 100
```

**Example:**
- Total Invested: 4,000 CHF (40,000 × 0.1)
- Gain: 1,000 CHF
- **Percentage = (1,000 / 4,000) × 100 = 25%**

### Portfolio Metrics
```typescript
totalValue = sum of all asset values
totalInvested = sum of (buyingPrice × quantity) or value if no buyingPrice
totalGain = totalValue - totalInvested
gainPercentage = (totalGain / totalInvested) × 100
```

---

## 🎨 Frontend Integration

### Fetch Assets
```typescript
const response = await fetch("/api/assets");
const assets = await response.json();
```

### Create Asset
```typescript
const response = await fetch("/api/assets", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Bitcoin",
    type: "CRYPTO",
    value: 45000,
    // ... other fields
  })
});

const newAsset = await response.json();
```

### Delete Asset
```typescript
const response = await fetch(`/api/assets/${assetId}`, {
  method: "DELETE"
});

if (response.ok) {
  // Asset deleted successfully
}
```

---

## 🚀 Performance Tips

### Database Indexes
```prisma
model Asset {
  id     String  @id
  userId String  @index  // Query by user
  type   AssetType @index  // Query by type
}
```

### Query Optimization
```typescript
// ❌ Bad: N+1 query
const assets = await prisma.asset.findMany();
for (const asset of assets) {
  const txns = await prisma.transaction.findMany({
    where: { assetId: asset.id }
  });
}

// ✅ Good: Single query with include
const assets = await prisma.asset.findMany({
  include: { transactions: true }
});
```

### Pagination (Future)
```typescript
const assets = await prisma.asset.findMany({
  where: { userId },
  skip: (page - 1) * 10,
  take: 10,
  orderBy: { createdAt: "desc" }
});
```

---

## 📝 Logging

### Prisma Query Log
```bash
export PRISMA_QUERY_ENGINE_LOG=true
npm run dev
```

### Application Logs
```typescript
console.log("Creating asset:", { name, type, value });
console.error("Error fetching assets:", error);
```

---

## 🔧 Development Tools

### Prisma Studio
```bash
npx prisma studio
# Opens http://localhost:5555
# Visual DB explorer
```

### Prisma Generate
```bash
npx prisma generate
# Regenerate client after schema changes
```

### Migration Commands
```bash
npx prisma migrate dev          # Apply migrations + generate
npx prisma migrate status       # Check status
npx prisma migrate reset        # ⚠️ Reset to initial state
npx prisma db push             # Push schema (dev only)
```

---

## 🎓 Common Patterns

### Create with Relation
```typescript
const asset = await prisma.asset.create({
  data: {
    name: "Bitcoin",
    type: "CRYPTO",
    value: 45000,
    user: {
      connect: { id: userId }  // Or use userId field
    }
  }
});
```

### Update Multiple Fields
```typescript
const updated = await prisma.asset.update({
  where: { id },
  data: {
    value: 48000,
    quantity: 0.15,
    buyingPrice: 41000
  }
});
```

### Aggregate Data
```typescript
const stats = await prisma.asset.aggregate({
  where: { userId },
  _sum: { value: true },
  _count: true
});

console.log(`Total: ${stats._sum.value}, Count: ${stats._count}`);
```

---

## 📞 References

- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js API Routes**: https://nextjs.org/docs/api-routes
- **PostgreSQL**: https://www.postgresql.org/docs
- **Clerk Auth**: https://clerk.com/docs

---

**Last Updated**: February 2024  
**API Version**: 1.0.0  
**Status**: Production Ready
