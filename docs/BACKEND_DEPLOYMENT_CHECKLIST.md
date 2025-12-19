# Backend Deployment Checklist - AI Forge Hub

**Purpose**: Comprehensive checklist to ensure backend deployment succeeds in one go.

**Based on**: All issues documented in `DEPLOYMENT_ISSUE_LOG.md`

**Last Updated**: December 19, 2025

---

## Pre-Deployment Verification

### ✅ Code Readiness

- [x] All tests passing (`npm test`)
- [x] TypeScript compiles without errors (`npm run build`)
- [x] No linting errors (`npm run lint`)
- [x] Prisma schema is up to date
- [x] All migrations applied to remote database
- [x] `package-lock.json` is committed to version control

### ✅ Docker Configuration

- [x] `Dockerfile` exists and addresses all known issues:
  - [x] **Issue #3**: Handles `package-lock.json` gracefully (conditional logic)
  - [x] **Issue #4**: Generates Prisma Client before TypeScript build
  - [x] **Issue #7**: Includes OpenSSL for Prisma
  - [x] **Issue #8**: Regenerates Prisma Client in production stage with OpenSSL
  - [x] **Issue #5**: Creates `logs/` and `uploads/` directories
  - [x] Sets proper permissions for directories
  - [x] Uses non-root user for security
  - [x] Includes health check endpoint

- [x] `.dockerignore` exists and excludes:
  - [x] `node_modules`
  - [x] `.env` files
  - [x] `dist` (will be built in container)
  - [x] Test files
  - [x] Documentation

### ✅ CORS Configuration (Issue #9)

- [x] `ALLOWED_ORIGINS` environment variable support added
- [x] CORS middleware updated to use `config.allowedOrigins`
- [x] Supports comma-separated origins
- [x] Falls back to `FRONTEND_URL` if `ALLOWED_ORIGINS` not set

### ✅ Local Docker Build Test

- [ ] Run `./test-docker-build.sh` locally
- [ ] Verify Docker image builds successfully
- [ ] Verify image can start (even if database connection fails)

---

## Environment Variables Required in DCDeploy

### Required Variables (Essential Only)

**IMPORTANT**: Only include essential variables. All other variables have defaults in `config/index.ts`.

```env
# Essential Environment Variables Only
# All other variables have defaults in config/index.ts

# Database (from Step 2 - already migrated)
DATABASE_URL="postgresql://yRNDQm:TEdbSyb49Q@database-whbqewat8i.tcp-proxy-2212.dcdeploy.cloud:30523/database-db"

# JWT Authentication (MUST be 32+ characters, use strong production secrets)
JWT_SECRET="your-production-jwt-secret-minimum-32-characters-long"
JWT_REFRESH_SECRET="your-production-jwt-refresh-secret-minimum-32-characters-long"

# Node Environment
NODE_ENV=production

# Frontend URL (for CORS - CRITICAL: Must match deployed frontend URL)
# Issue #4: If not set correctly, frontend requests will be blocked by CORS
FRONTEND_URL="https://frontend-whbqewat8i.dcdeploy.cloud"

# CORS Configuration (Issue #9, #4 - CRITICAL: Must include deployed frontend URL)
# Comma-separated list of allowed origins
ALLOWED_ORIGINS="https://frontend-whbqewat8i.dcdeploy.cloud,http://localhost:8080"

# Email Service (Resend)
RESEND_API_KEY="re_MpYK9CHH_AZCSz2PSUFiHfx3rXThM7EVM"
```

**Variables with Defaults** (don't need to be set unless overriding):
- `PORT` (default: 3001)
- `JWT_EXPIRES_IN` (default: 7d)
- `JWT_REFRESH_EXPIRES_IN` (default: 30d)
- `LOG_LEVEL` (default: info)
- `FROM_EMAIL` (default: noreply@yourdomain.com)
- `UPLOAD_DIR` (default: ./uploads)
- `MAX_FILE_SIZE` (default: 5242880)
- And many more - see `backend/src/config/index.ts` for all defaults

### Important Notes

1. **JWT Secrets**: Must be at least 32 characters long (enforced by config validation)
2. **ALLOWED_ORIGINS** (Issue #4): **CRITICAL** - Must include deployed frontend URL or CORS will block requests
3. **DATABASE_URL**: Already configured from Step 2
4. **FRONTEND_URL** (Issue #4): **CRITICAL** - Must match deployed frontend URL exactly
5. **After updating CORS variables**: **Restart backend service** in DCDeploy for changes to take effect

---

## Deployment Steps

### Step 1: Push Code to GitHub

```bash
cd /Users/user/Desktop/AI/projects/contextfirstai
git add .
git commit -m "Add Dockerfile and deployment configuration"
git push origin main
```

### Step 2: Configure DCDeploy

1. **Create Backend Service** in DCDeploy dashboard
2. **Connect GitHub Repository**
3. **Set Build Context**: `backend/`
4. **Set Dockerfile Path**: `backend/Dockerfile`
5. **Set Port**: `3001`

### Step 3: Set Environment Variables

Add all required environment variables listed above in DCDeploy dashboard.

**Critical**: Set `ALLOWED_ORIGINS` before deploying frontend to avoid CORS issues.

### Step 4: Deploy

1. Click **Deploy** in DCDeploy
2. Monitor build logs for:
   - ✅ Prisma Client generation (should see no OpenSSL warnings)
   - ✅ TypeScript compilation
   - ✅ All migrations applied
   - ✅ Health check passing

### Step 5: Verify Deployment

1. **Check Health Endpoint**:
   ```bash
   curl https://your-backend-url.dcdeploy.cloud/api/health
   ```
   Expected: `{"status":"ok"}`

2. **Check Database Connection**:
   - Health endpoint should return database status
   - No Prisma connection errors in logs

3. **Check CORS**:
   - Verify `Access-Control-Allow-Origin` header is present
   - Test from frontend origin

---

## Issues Addressed in This Deployment

### ✅ Issue #3: Missing package-lock.json
- **Solution**: Conditional logic in Dockerfile handles both cases
- **Status**: Addressed

### ✅ Issue #4: Prisma Client Generated After TypeScript Build
- **Solution**: Prisma Client generated before TypeScript compilation
- **Status**: Addressed

### ✅ Issue #7: Prisma OpenSSL Detection Failure
- **Solution**: OpenSSL installed in production stage
- **Status**: Addressed

### ✅ Issue #8: Prisma Client Generated Without OpenSSL
- **Solution**: Prisma Client regenerated in production stage with OpenSSL available
- **Status**: Addressed

### ✅ Issue #5: Missing Logs Directory
- **Solution**: `logs/` and `uploads/` directories created in Dockerfile
- **Status**: Addressed

### ✅ Issue #9: CORS Error
- **Solution**: `ALLOWED_ORIGINS` environment variable support added
- **Status**: Addressed

---

## Troubleshooting

### Build Fails: "Cannot find module '@prisma/client'"
- **Cause**: Prisma Client not generated before TypeScript build
- **Fix**: Verify Prisma schema is copied and `npx prisma generate` runs before `npm run build`

### Runtime Error: "Prisma failed to detect OpenSSL"
- **Cause**: OpenSSL not available when Prisma Client was generated
- **Fix**: Verify Prisma Client is regenerated in production stage after installing OpenSSL

### Runtime Error: "ENOENT: no such file or directory, open 'logs/error-*.log'"
- **Cause**: Logs directory doesn't exist
- **Fix**: Verify `mkdir -p /app/logs /app/uploads` runs in Dockerfile

### CORS Error: Frontend blocked by backend
- **Cause**: `ALLOWED_ORIGINS` not set or incorrect
- **Fix**: Set `ALLOWED_ORIGINS` environment variable with frontend URL

### Database Connection Error
- **Cause**: `DATABASE_URL` incorrect or database not accessible
- **Fix**: Verify `DATABASE_URL` is correct and database is accessible from DCDeploy

---

## Success Criteria

- [ ] Docker build completes without errors
- [ ] Container starts successfully
- [ ] Health endpoint returns `200 OK`
- [ ] Database connection successful
- [ ] No Prisma OpenSSL warnings
- [ ] CORS headers present and correct
- [ ] Logs directory writable
- [ ] Uploads directory writable

---

## Post-Deployment

1. **Test API Endpoints**:
   - Health: `GET /api/health`
   - Auth: `POST /api/auth/register`, `POST /api/auth/login`
   - Content: `GET /api/content/trainings`

2. **Monitor Logs**:
   - Check for any errors in DCDeploy logs
   - Verify Winston logger is writing to `logs/` directory

3. **Update Frontend**:
   - Set `VITE_API_URL` to backend URL
   - Deploy frontend
   - Test frontend-backend communication

---

## Related Files

- `backend/Dockerfile` - Main Dockerfile with all fixes
- `backend/.dockerignore` - Files excluded from build
- `backend/test-docker-build.sh` - Local Docker build test script
- `docs/DEPLOYMENT_ISSUE_LOG.md` - All deployment issues and solutions
- `docs/DEPLOYMENT.md` - Complete deployment guide

---

**Last Updated**: December 19, 2025  
**Status**: Ready for Deployment

