# Testing Strategy - Real Application Testing

## Problem Statement

**Issue**: Tests pass (190+ tests) but the actual application doesn't work:
- CORS errors on first request
- Login/register APIs don't work
- After login, nothing works
- Unit/system/integration tests all pass but don't catch real issues

## Root Causes

### 1. **CORS Configuration Mismatch**
- Backend CORS configured for `http://localhost:3000`
- Frontend runs on `http://localhost:8080` (Vite default)
- Tests don't test real CORS headers
- **Solution**: Allow multiple origins, especially in development

### 2. **API URL Mismatch**
- Frontend uses `VITE_API_URL` environment variable
- If not set, defaults to `http://localhost:3001/api`
- Backend might be running on different port
- **Solution**: Ensure `.env` files are configured correctly

### 3. **Authentication Flow Not Tested End-to-End**
- Unit tests mock everything
- Integration tests don't test with real CORS
- Cookie handling not tested properly
- **Solution**: Create integration tests that test real HTTP requests

### 4. **Missing Environment Variables**
- Tests use different env vars than runtime
- Missing `FRONTEND_URL`, `VITE_API_URL` in actual runtime
- **Solution**: Document all required env vars

## Testing Strategy

### 1. **Unit Tests** (Current - Keep These)
- Test individual functions/services
- Mock external dependencies
- Fast execution
- **Purpose**: Test business logic

### 2. **Integration Tests** (NEW - Add These)
- Test real API endpoints with `supertest`
- Test CORS headers
- Test authentication flow end-to-end
- Test cookie handling
- **Purpose**: Test API contracts and CORS

### 3. **E2E Tests** (Recommended - Add Later)
- Test full user flows
- Use Playwright or Cypress
- Test in real browser
- **Purpose**: Test complete user experience

## Implementation

### Integration Test Example

```typescript
// backend/src/__tests__/integration/authFlow.test.ts
import request from 'supertest';
import app from '../../app';

describe('Authentication Flow - Real API', () => {
  it('should handle CORS correctly', async () => {
    const response = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:8080')
      .set('Access-Control-Request-Method', 'POST');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should register and login successfully', async () => {
    // Register
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .set('Origin', 'http://localhost:8080')
      .send({ email: 'test@example.com', password: 'Test123!', name: 'Test' });

    expect(registerResponse.status).toBe(201);

    // Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:8080')
      .send({ email: 'test@example.com', password: 'Test123!' });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.accessToken).toBeDefined();
  });
});
```

## Required Environment Variables

### Backend `.env`
```bash
# Server
PORT=3001
NODE_ENV=development

# Frontend (for CORS)
FRONTEND_URL=http://localhost:8080

# Database
DATABASE_URL=postgresql://user@localhost:5432/contextfirstai_db

# JWT
JWT_SECRET=your-32-character-secret-here
JWT_REFRESH_SECRET=your-32-character-refresh-secret-here

# Email
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### Frontend `.env`
```bash
VITE_API_URL=http://localhost:3001/api
```

## Testing Checklist

Before deploying, ensure:

- [ ] Integration tests pass (test real API)
- [ ] CORS allows frontend origin
- [ ] Authentication flow works end-to-end
- [ ] Cookies are set correctly
- [ ] Protected routes require authentication
- [ ] Environment variables are set correctly
- [ ] Frontend can connect to backend
- [ ] API responses include CORS headers

## Prevention

1. **Always test with real HTTP requests** - Don't just mock
2. **Test CORS explicitly** - It's often the first failure
3. **Test authentication flow end-to-end** - Register → Login → Use token
4. **Use same environment in tests and runtime** - Don't skip CORS in tests
5. **Document environment variables** - Make them explicit
6. **Add integration tests to CI/CD** - Catch issues before deployment

