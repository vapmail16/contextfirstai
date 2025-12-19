# Integration Testing Guide

## Why Integration Tests Matter

**Problem**: Unit tests pass but the application doesn't work in real usage.

**Solution**: Integration tests that test the **actual running API** with real HTTP requests, CORS, cookies, and authentication.

## What Integration Tests Cover

### 1. CORS Testing
- Tests that CORS headers are set correctly
- Tests that OPTIONS requests work
- Tests that credentials are allowed
- **Catches**: CORS errors that prevent frontend from connecting

### 2. Authentication Flow
- Tests registration → login → token usage
- Tests cookie handling (refresh tokens)
- Tests protected routes
- **Catches**: Auth failures, token issues, cookie problems

### 3. Real HTTP Requests
- Uses `supertest` to make actual HTTP requests
- Tests real Express app (not mocked)
- Tests middleware stack
- **Catches**: Route issues, middleware problems

## Running Integration Tests

```bash
cd backend
npm test -- authFlow.test.ts
```

## What These Tests Verify

✅ **CORS Configuration**
- Frontend can make requests to backend
- CORS headers are present
- Credentials are allowed

✅ **Registration**
- User can register
- Duplicate emails are rejected
- Password is hashed

✅ **Login**
- User can login with correct credentials
- Access token is returned
- Refresh token cookie is set
- Invalid credentials are rejected

✅ **Protected Routes**
- Authenticated requests work
- Unauthenticated requests are rejected
- Admin routes require admin role

## Adding More Integration Tests

### Example: Content API Integration Test

```typescript
describe('Content API - Real Integration', () => {
  let accessToken: string;

  beforeAll(async () => {
    // Login and get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    accessToken = loginResponse.body.data.accessToken;
  });

  it('should fetch trainings with CORS', async () => {
    const response = await request(app)
      .get('/api/content/trainings')
      .set('Origin', 'http://localhost:8080');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should create training as admin', async () => {
    const response = await request(app)
      .post('/api/admin/trainings')
      .set('Origin', 'http://localhost:8080')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Training',
        description: 'Description',
        category: 'INTRODUCTORY',
        level: 'BEGINNER',
        externalLink: 'https://example.com',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Test Training');
  });
});
```

## Key Differences from Unit Tests

| Unit Tests | Integration Tests |
|------------|-------------------|
| Mock everything | Test real API |
| Fast | Slower (real HTTP) |
| Test functions | Test endpoints |
| No CORS | Test CORS |
| No cookies | Test cookies |
| Mock auth | Test real auth |

## Best Practices

1. **Test Real API**: Use `supertest` with actual Express app
2. **Test CORS**: Always test with Origin header
3. **Test Cookies**: Verify cookies are set correctly
4. **Test Auth Flow**: Register → Login → Use token
5. **Clean Database**: Use `beforeEach` to clean test data
6. **Test Error Cases**: 401, 403, 404, 409, etc.

## Common Issues Caught

✅ **CORS Errors**: Tests fail if CORS not configured
✅ **Auth Failures**: Tests fail if tokens not working
✅ **Cookie Issues**: Tests fail if cookies not set
✅ **Route Problems**: Tests fail if routes not mounted
✅ **Middleware Issues**: Tests fail if middleware broken

## Next Steps

1. Add integration tests for all major flows
2. Add integration tests for content APIs
3. Add integration tests for admin APIs
4. Run integration tests in CI/CD
5. Document all test scenarios

