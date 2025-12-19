# Deployment Guide - AI Forge Hub

**Purpose**: Step-by-step guide for deploying the AI Forge Hub application to dcdeploy.

**Last Updated**: December 19, 2025

**CRITICAL RULE**: Follow each step in order. Do not skip steps. Verify each step before proceeding to the next.

---

## Prerequisites

Before starting deployment, ensure you have:
- ✅ Application code is complete and tested locally
- ✅ All tests passing (`npm test` in both backend and frontend)
- ✅ Database migrations are ready
- ✅ Environment variables documented
- ✅ dcdeploy account access

---

## Step 1: Create Database Instance on dcdeploy

### 1.1 Create PostgreSQL Database

1. Log in to your dcdeploy dashboard
2. Navigate to **Database** section
3. Click **Create Database** or **Add Database Instance**
4. Select **PostgreSQL** as database type
5. Configure database settings:
   - **Database Name**: `database-db` (or your preferred name)
   - **Username**: `yRNDQm` (or auto-generated)
   - **Password**: `TEdbSyb49Q` (or auto-generated - save this securely)
   - **Region**: Select appropriate region
6. Click **Create** and wait for database to be provisioned

### 1.2 Get External Database Connection String

After database is created, dcdeploy will provide an external connection string:

**Format**:
```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]
```

**Example** (from your setup):
```
postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db
```

**Important Notes**:
- Save this connection string securely
- The connection string contains sensitive credentials
- This is the **external** connection string (for connecting from outside dcdeploy network)
- Internal connection strings may differ (for services within dcdeploy network)

### 1.3 Verify Database Connection

Test the connection string before proceeding:

```bash
# Test connection using psql (if installed)
psql "postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db"

# Or using Prisma Studio (if Prisma is configured)
cd backend
DATABASE_URL="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db" npx prisma studio
```

**Expected Result**: Connection successful, no errors.

---

## Step 2: Migrate Local Database to Remote Database

### 2.1 Verify Local Database Configuration

**IMPORTANT**: Before proceeding, verify your local database configuration:

```bash
cd backend

# Check actual DATABASE_URL from .env file
cat .env | grep DATABASE_URL

# Expected output for this project:
# DATABASE_URL=postgresql://$USER@localhost:5432/contextfirstai_db
```

**Local Database Details**:
- **Database Name**: `contextfirstai_db`
- **Connection Format**: `postgresql://$USER@localhost:5432/contextfirstai_db`
- **User**: Current system user (`$USER` environment variable)

### 2.2 Backup Local Database (Optional but Recommended)

Before migrating, create a backup of your local database:

```bash
cd backend

# Get actual database name from .env
LOCAL_DB_NAME="contextfirstai_db"  # From your .env file
LOCAL_USER=$(whoami)  # Current system user

# Backup local database schema
pg_dump -h localhost -U $LOCAL_USER -d $LOCAL_DB_NAME --schema-only > local_schema_backup.sql

# Backup local database data (if you want to migrate data too)
pg_dump -h localhost -U $LOCAL_USER -d $LOCAL_DB_NAME --data-only > local_data_backup.sql
```

### 2.3 Update Local .env for Migration

Update your local `.env` file to point to the remote database:

```bash
cd backend

# Backup current .env (in case you need to restore later)
cp .env .env.local.backup

# Update DATABASE_URL to remote database
# Edit .env file and change DATABASE_URL to:
DATABASE_URL="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db"
```

**Important**: 
- Keep your `.env.local.backup` file for reference
- After migration, `.env` will continue pointing to remote database (this is intentional)
- If you want local development to use remote database, keep this configuration
- If you want to use local database for development, restore from `.env.local.backup` after migration

### 2.4 Run Prisma Migrations

**IMPORTANT**: Based on previous deployment issues, follow these steps carefully:

1. **Verify DATABASE_URL is set correctly** (from Issue #7):
```bash
cd backend

# Verify DATABASE_URL points to remote database
cat .env | grep DATABASE_URL
# Should show: DATABASE_URL="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db"
```

2. **Test database connection first** (prevents Issue #7 - Prisma connection errors):
```bash
# Test connection using psql
psql "postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db" -c "SELECT version();"

# Or test with Prisma
npx prisma db execute --stdin --url="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db" <<< "SELECT 1;"
```

3. **Generate Prisma Client** (prevents Issue #4 - Prisma Client order):
```bash
# Generate Prisma client first (required before migrations)
npm run prisma:generate
```

4. **Apply migrations to remote database**:
```bash
# Use migrate deploy (NOT migrate dev) for production
# migrate deploy applies migrations without creating new ones
npm run prisma:migrate:deploy

# OR directly:
npx prisma migrate deploy
```

**Expected Output**:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "database-db", schema "public" at "database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523"

4 migrations found in prisma/migrations

Applying migration `20251219005434_init`
Applying migration `20251219010750_add_content_models`
Applying migration `20251219012551_add_all_content_models`
Applying migration `20251219015001_add_contact_and_newsletter`

The following migration(s) have been applied:
migrations/
  └─ 20251219005434_init/
    └─ migration.sql
  └─ 20251219010750_add_content_models/
    └─ migration.sql
  └─ 20251219012551_add_all_content_models/
    └─ migration.sql
  └─ 20251219015001_add_contact_and_newsletter/
    └─ migration.sql
      
✅ All migrations have been successfully applied.
```

**✅ Migration Completed Successfully** (December 19, 2025):
- All 4 migrations applied to remote database
- All tables created successfully
- Migration history recorded in `_prisma_migrations` table

**If you see errors**:
- **Connection timeout**: Check network connectivity and firewall settings
- **Authentication failed**: Verify username and password in connection string
- **Database doesn't exist**: Create database in dcdeploy dashboard first
- **Prisma OpenSSL warning**: This is expected in local environment, but ensure OpenSSL is available in production (Issue #7, #8)

### 2.5 Verify Migration Success

Verify that all tables were created:

```bash
cd backend

# Open Prisma Studio pointing to remote database
DATABASE_URL="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db" npx prisma studio

# Or check using psql
psql "postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db" -c "\dt"
```

**Expected Result**: 
- All tables from schema exist
- Migration history table (`_prisma_migrations`) exists
- No errors

**✅ Verification Completed** (December 19, 2025):
- All tables verified: `users`, `sessions`, `trainings`, `tools`, `products`, `knowledge_articles`, `community_links`, `contact_submissions`, `newsletter_subscriptions`, and all other schema tables
- Migration history confirmed: All 4 migrations recorded in `_prisma_migrations` table
- Database ready for application use

### 2.6 (Optional) Migrate Seed Data

If you have seed data in your local database that you want to migrate:

```bash
cd backend

# Run seed script pointing to remote database
DATABASE_URL="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db" npm run seed
```

**Note**: Only migrate seed data if needed. Production databases typically start empty.

---

## Step 3: Update Environment Variables

### 3.1 Create Production .env File

Create a production environment file:

```bash
cd backend

# Create .env.production file
cp .env .env.production
```

### 3.2 Update Production Environment Variables

**IMPORTANT**: Only include essential variables. All other variables have defaults in `config/index.ts`.

Edit `.env.production` with production values:

```env
# Essential Environment Variables Only
# All other variables have defaults in config/index.ts

# Database (from Step 2 - already migrated)
DATABASE_URL="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db"

# JWT Authentication (must be 32+ characters, use strong production secrets)
JWT_SECRET="your-production-jwt-secret-minimum-32-characters-long-here"
JWT_REFRESH_SECRET="your-production-jwt-refresh-secret-minimum-32-characters-long-here"

# Node Environment
NODE_ENV=production

# Frontend URL (for CORS - update after frontend deployment)
FRONTEND_URL="https://your-production-frontend-url.dcdeploy.cloud"

# Email Service (Resend)
RESEND_API_KEY="re_MpYK9CHH_AZCSz2PSUFiHfx3rXThM7EVM"
```

**Important**:
- **Only include essential variables** - All other variables use defaults from `config/index.ts`
- **Use actual values, not placeholders** - Populate with real production values
- **Generate strong secrets** - JWT secrets must be 32+ characters
- **Never commit `.env.production`** to version control
- **Add `.env.production`** to `.gitignore`

**Variables with Defaults** (don't need to be in .env unless overriding):
- `PORT` (default: 3001)
- `JWT_EXPIRES_IN` (default: 7d)
- `JWT_REFRESH_EXPIRES_IN` (default: 30d)
- `COOKIE_DOMAIN` (default: localhost)
- `COOKIE_SECURE` (default: false)
- `RATE_LIMIT_*` (all have defaults)
- `LOG_LEVEL` (default: info)
- `FROM_EMAIL` (default: noreply@yourdomain.com)
- And many more - see `backend/src/config/index.ts` for all defaults

### 3.3 Restore Local .env

Restore your local development environment:

```bash
cd backend

# Restore local .env from backup
cp .env.local.backup .env

# Or manually edit .env to point back to local database
DATABASE_URL="postgresql://$USER@localhost:5432/contextfirstai_db"
NODE_ENV=development
```

---

## Step 4: Test Database Migration (TDD Approach)

### 4.1 Write Migration Tests

Create tests to verify the migration was successful:

**File**: `backend/src/__tests__/migration/remoteDatabase.test.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import config from '../../config';

describe('Remote Database Migration', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    // Use remote database URL from environment
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.REMOTE_DATABASE_URL || config.databaseUrl,
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Database Connection', () => {
    it('should connect to remote database', async () => {
      await expect(prisma.$connect()).resolves.not.toThrow();
    });

    it('should execute a simple query', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });
  });

  describe('Schema Verification', () => {
    it('should have all required tables', async () => {
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `;

      const tableNames = tables.map(t => t.tablename);
      
      // Verify core tables exist
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('trainings');
      expect(tableNames).toContain('tools');
      expect(tableNames).toContain('products');
      expect(tableNames).toContain('knowledge_articles');
      expect(tableNames).toContain('community_links');
      expect(tableNames).toContain('contact_submissions');
      expect(tableNames).toContain('newsletter_subscriptions');
    });

    it('should have migration history table', async () => {
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = '_prisma_migrations'
      `;

      expect(tables).toHaveLength(1);
    });

    it('should have applied all migrations', async () => {
      const migrations = await prisma.$queryRaw<Array<{ migration_name: string }>>`
        SELECT migration_name 
        FROM _prisma_migrations 
        ORDER BY finished_at DESC
      `;

      // Verify at least the initial migration exists
      expect(migrations.length).toBeGreaterThan(0);
      expect(migrations.some(m => m.migration_name.includes('init'))).toBe(true);
    });
  });

  describe('Table Structure Verification', () => {
    it('should have users table with correct columns', async () => {
      const columns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY column_name
      `;

      const columnNames = columns.map(c => c.column_name);
      
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('password');
      expect(columnNames).toContain('role');
      expect(columnNames).toContain('is_active');
    });

    it('should have trainings table with correct columns', async () => {
      const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'trainings'
      `;

      const columnNames = columns.map(c => c.column_name);
      
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('title');
      expect(columnNames).toContain('description');
      expect(columnNames).toContain('category');
      expect(columnNames).toContain('external_link');
    });
  });

  describe('Indexes Verification', () => {
    it('should have indexes on users table', async () => {
      const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'users'
      `;

      expect(indexes.length).toBeGreaterThan(0);
    });

    it('should have unique constraint on users.email', async () => {
      const constraints = await prisma.$queryRaw<Array<{ constraint_name: string; constraint_type: string }>>`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'users' AND constraint_type = 'UNIQUE'
      `;

      expect(constraints.some(c => c.constraint_name.includes('email'))).toBe(true);
    });
  });

  describe('Foreign Key Verification', () => {
    it('should have foreign keys properly configured', async () => {
      const foreignKeys = await prisma.$queryRaw<Array<{ constraint_name: string; table_name: string }>>`
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        ORDER BY table_name
      `;

      expect(foreignKeys.length).toBeGreaterThan(0);
    });
  });
});
```

### 4.2 Run Migration Tests

Run the tests to verify migration:

```bash
cd backend

# Set remote database URL for testing
REMOTE_DATABASE_URL="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db" npm test -- migration/remoteDatabase.test.ts
```

**Expected Result**: All tests pass, confirming:
- ✅ Database connection works
- ✅ All tables exist
- ✅ Migration history is correct
- ✅ Table structures are correct
- ✅ Indexes and constraints are in place

### 4.3 Update Test Configuration

Add remote database URL to test configuration:

**File**: `backend/jest.config.js` (or similar)

```javascript
module.exports = {
  // ... existing config
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testEnvironment: 'node',
  // ... rest of config
};
```

**File**: `backend/src/test/setup.ts`

```typescript
// Load environment variables for tests
import dotenv from 'dotenv';
import path from 'path';

// Load .env.test if it exists, otherwise use .env
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Set default test database URL if not provided
if (!process.env.REMOTE_DATABASE_URL && process.env.NODE_ENV === 'test') {
  // Use local test database by default
      process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/contextfirstai_db';
}
```

---

## Step 5: Backend Deployment

### 5.1 Prerequisites

Before deploying the backend, ensure:
- ✅ Database migration completed (Step 2)
- ✅ Environment variables configured (Step 3)
- ✅ All tests passing locally
- ✅ Dockerfile and .dockerignore created
- ✅ Code pushed to GitHub repository

### 5.2 Deploy Backend to DCDeploy

1. **Connect Repository**:
   - Repository: `https://github.com/vapmail16/contextfirstai.git`
   - Build Context: `backend/`
   - Dockerfile Path: `backend/Dockerfile`

2. **Configure Service**:
   - Service Name: `contextfirstai-backend`
   - Port: `3001`

3. **Set Environment Variables** (see `docs/BACKEND_DEPLOYMENT_CHECKLIST.md` for full list):
   ```env
   DATABASE_URL="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db"
   JWT_SECRET="<64-character-secure-hex-string>"
   JWT_REFRESH_SECRET="<64-character-secure-hex-string>"
   NODE_ENV=production
   FRONTEND_URL="https://your-frontend-url.dcdeploy.cloud"
   RESEND_API_KEY="re_MpYK9CHH_AZCSz2PSUFiHfx3rXThM7EVM"
   ALLOWED_ORIGINS="https://your-frontend-url.dcdeploy.cloud,http://localhost:8080"
   ```

4. **Deploy**:
   - Click "Deploy" and monitor build logs
   - Wait for deployment to complete
   - Note the backend URL (e.g., `https://backend-xxxxx.dcdeploy.cloud`)

### 5.3 Verify Backend Deployment

```bash
# Health check
curl https://your-backend-url.dcdeploy.cloud/api/health

# Expected response:
# {"status":"ok","database":"connected"}
```

### 5.4 Backend Deployment Checklist

See `docs/BACKEND_DEPLOYMENT_CHECKLIST.md` for detailed checklist and troubleshooting.

**Status**: ✅ Backend deployed successfully in 1-go (December 19, 2025)

---

## Step 6: Frontend Deployment

### 6.1 Prerequisites

Before deploying the frontend, ensure:
- ✅ Backend deployed and accessible (Step 5)
- ✅ Backend URL available (e.g., `https://backend-xxxxx.dcdeploy.cloud`)
- ✅ Dockerfile and nginx.conf created
- ✅ Code pushed to GitHub repository

### 6.2 Deploy Frontend to DCDeploy

1. **Connect Repository**:
   - Repository: `https://github.com/vapmail16/contextfirstai.git`
   - Build Context: `frontend/`
   - Dockerfile Path: `frontend/Dockerfile`

2. **Configure Service**:
   - Service Name: `contextfirstai-frontend`
   - Port: `3001`

3. **Set Build Arguments** (CRITICAL - Must be build arguments, not runtime env vars):
   ```bash
   # Build Argument (from DCDeploy backend deployment)
   VITE_API_URL=https://backend-whbqewat8i.dcdeploy.cloud/api
   ```
   
   In DCDeploy dashboard:
   - Navigate to **Build Arguments** section (not Environment Variables)
   - Add build argument:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://backend-whbqewat8i.dcdeploy.cloud/api`

   **CRITICAL Notes**: 
   - Vite requires `VITE_` prefix for environment variables
   - Variables are embedded at **build time** (not runtime)
   - Must be set as **build argument** in DCDeploy, not runtime environment variable
   - Dockerfile accepts `VITE_API_URL` as build argument (`ARG VITE_API_URL`)
   - After changing `VITE_API_URL`, you must **rebuild** the frontend
   - **Issue #3**: Setting as runtime env var will cause localhost connection errors

4. **Deploy**:
   - Click "Deploy" and monitor build logs
   - Wait for deployment to complete
   - Note the frontend URL (e.g., `https://frontend-xxxxx.dcdeploy.cloud`)

### 6.3 Update Backend CORS (CRITICAL - Issue #4)

**⚠️ IMPORTANT**: After frontend deployment, you MUST update backend CORS configuration or frontend requests will be blocked.

Go to backend service settings in DCDeploy and update environment variables:

**Backend Environment Variables** (update in DCDeploy):
```env
# CRITICAL: Replace with your actual frontend URL from DCDeploy
FRONTEND_URL=https://frontend-whbqewat8i.dcdeploy.cloud
ALLOWED_ORIGINS=https://frontend-whbqewat8i.dcdeploy.cloud,http://localhost:8080
```

**⚠️ CRITICAL STEPS**:
1. Update `FRONTEND_URL` to your actual deployed frontend URL
2. Update `ALLOWED_ORIGINS` to include your deployed frontend URL (comma-separated)
3. **Restart backend service** in DCDeploy (not just redeploy - restart is required)
4. Without restarting, CORS errors will persist (Issue #4)

### 6.4 Verify Frontend Deployment

1. **Health Check**:
   ```bash
   curl https://your-frontend-url.dcdeploy.cloud/nginx-health
   # Expected: healthy
   ```

2. **Frontend Loads**:
   - Visit: `https://your-frontend-url.dcdeploy.cloud`
   - Should see the application
   - No console errors
   - API calls should work (if backend CORS is configured)

3. **Check Browser Console**:
   - No CORS errors
   - API calls succeed
   - No 404 errors for static assets

### 6.5 Frontend Deployment Checklist

See `docs/FRONTEND_DEPLOYMENT_CHECKLIST.md` for detailed checklist and troubleshooting.

---

## Step 7: Verify Migration Completeness

### 5.1 Compare Local and Remote Schemas

Compare the schemas to ensure nothing is missing:

```bash
cd backend

# Get local schema
npx prisma db pull --schema=./prisma/schema.prisma > local_schema.txt

# Get remote schema (temporarily point to remote)
DATABASE_URL="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db" npx prisma db pull --schema=./prisma/schema.prisma > remote_schema.txt

# Compare (if you have diff tool)
diff local_schema.txt remote_schema.txt
```

### 5.2 Verify Data Integrity (if data was migrated)

If you migrated data, verify it:

```bash
cd backend

# Count records in local database
LOCAL_DB_NAME="contextfirstai_db"
LOCAL_USER=$(whoami)
psql -h localhost -U $LOCAL_USER -d $LOCAL_DB_NAME -c "SELECT 'users' as table, COUNT(*) FROM users UNION ALL SELECT 'trainings', COUNT(*) FROM trainings;"

# Count records in remote database
psql "postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db" -c "SELECT 'users' as table, COUNT(*) FROM users UNION ALL SELECT 'trainings', COUNT(*) FROM trainings;"
```

---

## Prevention Checklist (Based on Previous Deployment Issues)

Before proceeding with migration, ensure:

- [x] **Verified local database configuration** (Issue #1)
- [ ] **Tested remote database connection** (prevents Issue #7)
- [ ] **Generated Prisma Client before migrations** (prevents Issue #4)
- [ ] **Using `prisma migrate deploy` not `prisma migrate dev`** (for production)
- [ ] **Verified DATABASE_URL is correct** (prevents Issue #7)
- [ ] **All migrations exist locally** (check `prisma/migrations/` directory)

**Key Learnings from Previous Projects**:
1. **Always test connection first** - Don't assume it works
2. **Generate Prisma Client before migrations** - Order matters
3. **Use `migrate deploy` for production** - Not `migrate dev`
4. **Verify environment variables** - DATABASE_URL must be correct
5. **Check for OpenSSL warnings** - Prisma needs OpenSSL for PostgreSQL

---

## Troubleshooting

### Issue: Connection Timeout

**Symptoms**: Cannot connect to remote database

**Solutions**:
1. Verify database is running in dcdeploy dashboard
2. Check firewall/security group settings
3. Verify connection string is correct
4. Check if IP whitelist is required
5. Try connecting from different network

### Issue: Migration Fails

**Symptoms**: `prisma migrate deploy` fails

**Solutions**:
1. Check if database is empty (should be for fresh deployment)
2. Verify DATABASE_URL is correct
3. Check network connectivity
4. Review migration files for errors
5. Check Prisma version compatibility

### Issue: Tables Missing After Migration

**Symptoms**: Migration succeeds but tables don't exist

**Solutions**:
1. Check migration history: `SELECT * FROM _prisma_migrations;`
2. Verify schema.prisma matches expected structure
3. Run `prisma db push` as fallback (development only)
4. Check database user permissions

### Issue: Permission Denied

**Symptoms**: Permission errors when running migrations

**Solutions**:
1. Verify database user has CREATE TABLE permissions
2. Check if user has access to public schema
3. Verify user can create indexes
4. Check if user can create foreign keys

---

## Next Steps

After completing Step 1:
- ✅ Database instance created on dcdeploy
- ✅ External connection string obtained
- ✅ Local database migrated to remote
- ✅ Environment variables updated
- ✅ Migration verified with tests

**Proceed to**: Step 2 - Deploy Backend Application (to be documented)

---

## Notes

- This guide is project-specific for AI Forge Hub
- Will be generalized for other projects later
- All steps follow TDD approach where applicable
- Always verify each step before proceeding

