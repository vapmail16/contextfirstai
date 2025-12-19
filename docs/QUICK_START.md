# Quick Start Guide - Testing the Real Application

## The Problem

**Tests pass but application doesn't work?** This guide helps you test the **actual running application**, not just unit tests.

## Prerequisites

1. **Backend running** on `http://localhost:3001`
2. **Frontend running** on `http://localhost:8080`
3. **Database running** and migrated
4. **Environment variables configured**

## Step 1: Configure Environment Variables

### Backend `.env`
```bash
PORT=3001
FRONTEND_URL=http://localhost:8080  # MUST match frontend port
DATABASE_URL=postgresql://user@localhost:5432/contextfirstai_db
JWT_SECRET=your-32-character-secret-here
JWT_REFRESH_SECRET=your-32-character-refresh-secret-here
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### Frontend `.env`
```bash
VITE_API_URL=http://localhost:3001/api
```

## Step 2: Start Backend

```bash
cd backend
npm install
npm run dev
```

**Check**: Backend should be running on `http://localhost:3001`

## Step 3: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

**Check**: Frontend should be running on `http://localhost:8080`

## Step 4: Test the Application

### Test 1: CORS Check
Open browser console and check:
```javascript
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(console.log)
```

**Expected**: Should return health status without CORS error

### Test 2: Registration
```javascript
fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
  })
})
.then(r => r.json())
.then(console.log)
```

**Expected**: Should return user object (201 status)

### Test 3: Login
```javascript
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'TestPassword123!'
  })
})
.then(r => r.json())
.then(console.log)
```

**Expected**: Should return `{ success: true, data: { user, accessToken } }`

### Test 4: Authenticated Request
```javascript
// Use accessToken from login response
fetch('http://localhost:3001/api/auth/me', {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE'
  },
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
```

**Expected**: Should return current user

## Common Issues

### CORS Error
**Symptom**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Fix**: 
1. Check `FRONTEND_URL` in backend `.env` matches frontend port
2. Check CORS middleware is configured correctly
3. Restart backend after changing `.env`

### 401 Unauthorized
**Symptom**: Login/register returns 401

**Fix**:
1. Check database has users table
2. Check JWT secrets are set
3. Check password hashing is working
4. Check user exists in database

### 404 Not Found
**Symptom**: API endpoints return 404

**Fix**:
1. Check backend is running
2. Check routes are mounted correctly
3. Check API URL in frontend matches backend

### Cookies Not Set
**Symptom**: Refresh token cookie not being set

**Fix**:
1. Check `credentials: 'include'` in fetch requests
2. Check `withCredentials: true` in axios config
3. Check cookie domain matches frontend domain
4. Check `sameSite` and `secure` settings

## Integration Tests

Run integration tests that test the real API:

```bash
cd backend
npm test -- authFlow.test.ts
```

These tests:
- Test real HTTP requests
- Test CORS headers
- Test authentication flow
- Test cookie handling

## Next Steps

1. ✅ Fix CORS configuration
2. ✅ Run integration tests
3. ✅ Test in browser
4. ✅ Verify all endpoints work
5. ✅ Document any remaining issues

