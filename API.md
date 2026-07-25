# API Documentation — MAISON. Boutique

Base URL: `http://localhost:3001`

---

## Authentication

All admin routes require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "secret123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "cm...",
    "email": "jean@example.com",
    "name": "Jean Dupont",
    "role": "USER"
  }
}
```

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "admin@boutique.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "...", "name": "...", "role": "ADMIN" }
}
```

### GET /api/auth/me
Get current user profile. Requires `Authorization` header.

**Response (200):**
```json
{ "id": "...", "email": "...", "name": "...", "role": "USER" }
```

---

## Products (Public)

### GET /api/products
List products with optional filters and pagination.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category name |
| `search` | string | Search by product name |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12) |

**Response (200):**
```json
{
  "products": [
    {
      "id": "cm...",
      "name": "T-shirt Oversize Blanc",
      "description": "...",
      "price": 39.99,
      "image": "https://...",
      "category": "T-shirts",
      "sizes": ["S", "M", "L", "XL"],
      "colors": ["Blanc", "Noir"],
      "stock": 50,
      "featured": true,
      "createdAt": "2026-07-25T..."
    }
  ],
  "total": 13,
  "page": 1,
  "totalPages": 2
}
```

### GET /api/products/featured
Get featured products (max 8).

### GET /api/products/categories
Get list of unique categories.

**Response:** `["T-shirts", "Robes", "Vestes", ...]`

### GET /api/products/:id
Get single product by ID.

**Response (200):** Single product object.
**Response (404):** `{ "error": "Produit introuvable" }`

---

## Cart (Authenticated)

Requires `Authorization` header.

### GET /api/cart
Get current user's cart items.

**Response (200):**
```json
[
  {
    "id": "cm...",
    "userId": "...",
    "productId": "...",
    "quantity": 2,
    "size": "M",
    "color": "Noir",
    "product": { ... }
  }
]
```

### POST /api/cart
Add item to cart.

**Request:**
```json
{
  "productId": "cm...",
  "quantity": 1,
  "size": "M",
  "color": "Noir"
}
```
All fields except `productId` are optional.

### PUT /api/cart/:id
Update cart item quantity.

**Request:** `{ "quantity": 3 }`

### DELETE /api/cart/:id
Remove single item from cart.

### DELETE /api/cart
Clear entire cart.

---

## Orders (Authenticated)

### GET /api/orders
Get current user's order history.

**Response (200):** Array of orders with items and products.

### POST /api/orders/checkout
Create order from cart. Checks stock, decrements it, generates PDF invoice.

**Response (200):**
```json
{
  "order": {
    "id": "...",
    "total": 79.98,
    "status": "PAID",
    "items": [...]
  },
  "payment": {
    "success": true,
    "transactionId": "mock_...",
    "total": 79.98
  },
  "invoiceUrl": "/invoices/facture-xxxxxx.pdf"
}
```

**Errors:**
- `400` — Panier vide
- `400` — Stock insuffisant pour "..." (X restant(s))

### GET /invoices/:filename
Download invoice PDF. No auth required.

---

## Admin — Products

All routes require `ADMIN` role.

### GET /api/admin/products
List all products with filters.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name |
| `category` | string | Filter by category |
| `featured` | `"true"` | Only featured products |
| `lowStock` | `"true"` | Stock ≤ 5 |
| `sort` | string | Sort field: `name`, `price`, `stock`, `category`, `createdAt` |
| `order` | string | `asc` or `desc` (default: `desc`) |

### GET /api/admin/products/:id
Get single product.

### POST /api/admin/products
Create a new product.

**Request:**
```json
{
  "name": "Nouveau T-shirt",
  "description": "Description du produit",
  "price": 49.99,
  "image": "https://...",
  "category": "T-shirts",
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["Noir", "Blanc"],
  "stock": 100,
  "featured": false
}
```
`sizes` and `colors` accept arrays or JSON strings.

**Response (201):** Created product.

### PUT /api/admin/products/:id
Full update of a product. All fields optional.

**Request:**
```json
{
  "price": 59.99,
  "stock": 75,
  "featured": true,
  "name": "Nom mis à jour"
}
```

### PATCH /api/admin/products/:id
Partial update (same as PUT).

### DELETE /api/admin/products/:id
Delete a product.

**Response:** `{ "success": true }`

### POST /api/admin/products/:id/toggle-featured
Toggle featured status.

**Response:** Product with updated `featured` field.

### POST /api/admin/products/:id/duplicate
Duplicate a product (name gets " (copie)" suffix, stock set to 0).

**Response (201):** New product.

### POST /api/admin/products/batch-delete
Delete multiple products.

**Request:** `{ "ids": ["id1", "id2", "id3"] }`
**Response:** `{ "success": true, "deleted": 3 }`

### POST /api/admin/products/batch-update
Update multiple products with same data.

**Request:**
```json
{
  "ids": ["id1", "id2"],
  "data": { "stock": 50, "category": "Vestes" }
}
```
**Response:** `{ "success": true, "updated": 2 }`

### POST /api/admin/products/batch-stock
Adjust stock for multiple products (positive = add, negative = subtract).

**Request:** `{ "ids": ["id1", "id2"], "adjustment": -10 }`
**Response:** `{ "success": true, "adjusted": 2 }`

---

## Admin — Orders

### GET /api/admin/orders
List all orders with filters.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `search` | string | Search by customer name, email, or order ID |

### GET /api/admin/orders/:id
Get single order with items and customer info.

### PUT /api/admin/orders/:id/status
Update order status.

**Request:** `{ "status": "SHIPPED" }`

**Valid statuses:** `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`

---

## Admin — Users

### GET /api/admin/users
List all users.

**Response:**
```json
[
  {
    "id": "...",
    "name": "Admin",
    "email": "admin@boutique.com",
    "role": "ADMIN",
    "createdAt": "2026-07-25T..."
  }
]
```

### PUT /api/admin/users/:id/role
Change user role.

**Request:** `{ "role": "ADMIN" }` or `{ "role": "USER" }`

---

## Admin — Stats & Categories

### GET /api/admin/stats
Get dashboard statistics.

**Response:**
```json
{
  "totalProducts": 13,
  "totalOrders": 7,
  "totalUsers": 3,
  "revenue": 4004.98,
  "lowStock": 0,
  "outOfStock": 0,
  "categories": [
    { "name": "T-shirts", "count": 3 },
    { "name": "Robes", "count": 2 }
  ]
}
```

### GET /api/admin/categories
Get category stats with averages.

**Response:**
```json
[
  {
    "name": "T-shirts",
    "count": 3,
    "avgPrice": 46.66,
    "totalStock": 114
  }
]
```

---

## Contact

### POST /api/contact
Send a contact message.

**Request:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "subject": "commande",
  "message": "Ma question est..."
}
```
**Valid subjects:** `commande`, `produit`, `retour`, `partenariat`, `presse`, `autre`

**Response:** `{ "success": true, "message": "Message envoyé avec succès" }`

---

## Error Responses

All errors follow this format:
```json
{ "error": "Description de l'erreur" }
```

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Requête invalide (champs manquants, données invalides) |
| 401 | Non authentifié (token manquant ou invalide) |
| 403 | Accès interdit (rôle insuffisant) |
| 404 | Ressource introuvable |
| 500 | Erreur serveur |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@boutique.com | admin123 |
| Client | user@boutique.com | user123 |
