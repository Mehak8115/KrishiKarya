cont# Database Setup — Krishi Karya

PostgreSQL 14+ is required.

## 1. Create the database

```bash
createdb krishikarya
```run 

Or using psql:
```sql
CREATE DATABASE krishikarya;
```

## 2. Run the schema

```bash
psql -d krishikarya -f schema.sql
```

This creates all tables, enums and indexes. Safe to re-run (uses `IF NOT EXISTS`).

## 3. Seed sample data

```bash
psql -d krishikarya -f seed.sql
```

Inserts 14 farmers, 14 produce listings and a placeholder admin user.

> **Note:** Before seeding, generate a real bcrypt hash for the admin password and replace the placeholder in `seed.sql`:
> ```bash
> python -c "from passlib.hash import bcrypt; print(bcrypt.hash('Admin@1234'))"
> ```

## 4. Using Alembic (recommended for production)

```bash
cd backend
alembic init alembic
# Edit alembic/env.py to use your async engine
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

## Schema overview

| Table             | Description                              |
|-------------------|------------------------------------------|
| `users`           | Farmers, retailers and admins            |
| `farmers`         | Verified farmer profiles                 |
| `produce`         | Crop listings with grade and price       |
| `orders`          | Buyer orders                             |
| `order_items`     | Individual line items per order          |
| `contact_messages`| Messages submitted via the contact form  |

## Connection string format

```
postgresql+asyncpg://USER:PASSWORD@HOST:PORT/krishikarya
```

Set this as `DATABASE_URL` in `backend/.env`.
