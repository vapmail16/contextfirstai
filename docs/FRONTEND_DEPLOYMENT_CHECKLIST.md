# Frontend Deployment Checklist - AI Forge Hub

**Date**: December 19, 2025  
**Platform**: DCDeploy  
**Status**: Ready for Deployment

---

## Prerequisites

- [x] Backend deployed successfully (1-go deployment ✅)
- [x] Backend URL available (e.g., `https://backend-xxxxx.dcdeploy.cloud`)
- [x] Frontend Dockerfile created
- [x] Frontend nginx.conf created
- [x] Frontend .dockerignore created
- [x] Frontend .env file created with minimal variables

---

## DCDeploy Configuration

### Service Settings
- **Service Name**: `contextfirstai-frontend` (or your preferred name)
- **Repository**: `https://github.com/vapmail16/contextfirstai.git`
- **Build Context**: `frontend/`
- **Dockerfile Path**: `frontend/Dockerfile`
- **Port**: `3001`

**Note**: Dockerfile uses `node:20-alpine` to match package requirements (Vite 7.3.0, Vitest 4.0.16 require Node 20+)

### Build Arguments (Set in DCDeploy Dashboard)

**CRITICAL**: Vite requires environment variables at **build time**, not runtime. These must be set as **build arguments** in DCDeploy.

```bash
# Build Argument (REQUIRED - from DCDeploy backend deployment)
VITE_API_URL=https://backend-whbqewat8i.dcdeploy.cloud/api
```

**DCDeploy Configuration**:
1. Go to frontend service settings
2. Navigate to **Build Arguments** (not Environment Variables)
3. Add build argument:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://backend-whbqewat8i.dcdeploy.cloud/api`

**Note**: 
- Vite environment variables must be prefixed with `VITE_`
- These variables are embedded at **build time** (not runtime)
- Dockerfile accepts `VITE_API_URL` as build argument (`ARG VITE_API_URL`)
- After changing `VITE_API_URL`, you must **rebuild** the frontend
- Setting as runtime environment variable will NOT work (Issue #3)

---

## Deployment Steps

### 1. Backend URL (Already Available)
Backend URL from DCDeploy:
```
https://backend-whbqewat8i.dcdeploy.cloud
```

### 2. Set Environment Variable in DCDeploy
1. Go to DCDeploy dashboard
2. Navigate to frontend service settings
3. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://backend-whbqewat8i.dcdeploy.cloud/api`

### 3. Deploy Frontend
1. Connect repository: `https://github.com/vapmail16/contextfirstai.git`
2. Set build context: `frontend/`
3. Set Dockerfile path: `frontend/Dockerfile`
4. Set port: `3001`
5. Add environment variable: `VITE_API_URL`
6. Deploy

### 4. Update Backend CORS (If Not Done)
After frontend deployment, update backend CORS to allow frontend origin:

**Backend Environment Variables** (update in DCDeploy backend service):
```env
FRONTEND_URL=https://your-frontend-url.dcdeploy.cloud
ALLOWED_ORIGINS=https://your-frontend-url.dcdeploy.cloud,http://localhost:8080
```

**Note**: Replace `your-frontend-url.dcdeploy.cloud` with the actual frontend URL after frontend deployment.

**Then redeploy backend** to apply CORS changes.

---

## Verification

### 1. Health Check
```bash
curl https://your-frontend-url.dcdeploy.cloud/nginx-health
```
Expected: `healthy`

### 2. Frontend Loads
Visit: `https://your-frontend-url.dcdeploy.cloud`
- Should see the application
- No console errors
- API calls should work (if backend CORS is configured)

### 3. Check Browser Console
- No CORS errors
- API calls succeed
- No 404 errors for static assets

---

## Common Issues and Solutions

### Issue: Frontend Can't Connect to Backend

**Symptoms**:
- Network errors in browser console
- CORS errors
- 404 errors for API calls

**Solutions**:
1. **Check VITE_API_URL**: Ensure it's set correctly in DCDeploy
2. **Rebuild Frontend**: Vite embeds env vars at build time, so changes require rebuild
3. **Check Backend CORS**: Ensure backend `ALLOWED_ORIGINS` includes frontend URL
4. **Verify Backend URL**: Test backend health endpoint directly

### Issue: 404 Errors for Routes

**Symptoms**:
- Direct URL access returns 404
- Refresh on a route returns 404

**Solution**:
- This is handled by nginx.conf `try_files` directive
- Ensure nginx.conf is copied correctly in Dockerfile
- Verify `location /` has `try_files $uri $uri/ /index.html;`

### Issue: Static Assets Not Loading

**Symptoms**:
- CSS/JS files return 404
- Images not loading

**Solutions**:
1. **Check Build**: Ensure `npm run build` succeeded
2. **Check nginx.conf**: Verify static asset location block exists
3. **Check Dockerfile**: Ensure `dist` folder is copied correctly

---

## Frontend-Specific Considerations

### Environment Variables
- **Vite Requirement**: All env vars must have `VITE_` prefix
- **Build Time**: Vite embeds env vars at build time (not runtime)
- **Rebuild Required**: Changing env vars requires rebuilding the frontend

### SPA Routing
- **Client-Side Routing**: React Router handles routing
- **nginx Configuration**: `try_files` ensures all routes serve `index.html`
- **Direct URL Access**: Works correctly with nginx.conf

### Static Assets
- **Caching**: Static assets cached for 1 year (immutable)
- **Gzip**: Enabled for text-based files
- **MIME Types**: Properly configured in nginx.conf

---

## Files Created

- ✅ `frontend/Dockerfile` - Multi-stage build (Node builder + nginx production)
- ✅ `frontend/nginx.conf` - SPA routing and static file serving
- ✅ `frontend/.dockerignore` - Excludes unnecessary files from build
- ✅ `frontend/.env` - Minimal environment variables (VITE_API_URL)
- ✅ `frontend/test-docker-build.sh` - Local Docker build testing script

---

## Testing Locally

Before deploying, test the Docker build locally:

```bash
cd frontend
./test-docker-build.sh
```

Or manually:
```bash
docker build -t contextfirstai-frontend:test -f Dockerfile .
docker run -p 3001:3001 -e VITE_API_URL=http://localhost:3001/api contextfirstai-frontend:test
```

Visit: `http://localhost:3001`

---

## Deployment Statistics

**Target**: 1-go deployment (like backend)  
**Issues Addressed**: All known frontend deployment issues from previous projects  
**Status**: Ready for deployment

---

## Related Files

- `frontend/Dockerfile` - Main Dockerfile
- `frontend/nginx.conf` - Nginx configuration
- `frontend/.dockerignore` - Docker ignore file
- `frontend/.env` - Environment variables
- `docs/DEPLOYMENT_ISSUE_LOG.md` - Deployment issue log
- `docs/DEPLOYMENT.md` - Complete deployment guide

---

**Last Updated**: December 19, 2025  
**Status**: Ready for Deployment 🚀

