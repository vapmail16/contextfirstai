# Next Steps - AI Forge Hub Development Plan

## Current Status

✅ **Setup Complete:**
- Backend template copied and configured
- Frontend template copied and initialized
- Database created and migrated
- All tests passing (127/127)
- TDD guidelines updated
- Issue log updated with setup patterns

## Development Approach

**CRITICAL**: All features must be built using **Test Driven Development (TDD)**:
1. **RED**: Write failing test
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve while keeping tests green

## Phase 1 (MVP) - Priority Order

According to `initial_requirements`, Phase 1 includes:
1. Home
2. Training
3. Knowledge Hub
4. Tools
5. Community
6. Contact

## Recommended Development Order

### Step 1: Database Schema Design (TDD)

**Task**: Design database schema for Phase 1 features

**What to Create:**
- `trainings` table (for Training page)
- `knowledge_articles` table (for Knowledge Hub)
- `tools` table (for Tools page)
- `community_links` table (for Community page)
- `contact_submissions` table (for Contact page)
- `newsletter_subscriptions` table (for Newsletter)

**TDD Approach:**
1. Write tests for repository methods (RED)
2. Create Prisma schema
3. Run migrations
4. Implement repository methods (GREEN)
5. Refactor

**Files to Create:**
- `backend/prisma/schema.prisma` (add new models)
- `backend/src/repositories/training.repository.ts`
- `backend/src/repositories/knowledge.repository.ts`
- `backend/src/repositories/tool.repository.ts`
- `backend/src/__tests__/repositories/*.test.ts`

### Step 2: Backend API Development (TDD)

**For Each Feature (Training, Knowledge Hub, Tools, etc.):**

1. **Write Tests First (RED)**
   - Create test file: `backend/src/__tests__/routes/training.test.ts`
   - Write tests for all endpoints
   - Run tests (they should fail)

2. **Implement Routes (GREEN)**
   - Create route file: `backend/src/routes/training.ts`
   - Create service: `backend/src/services/trainingService.ts`
   - Implement minimal code to pass tests

3. **Refactor**
   - Improve code quality
   - Ensure all tests still pass

**API Endpoints Needed:**

**Training:**
- `GET /api/trainings` - List all trainings
- `GET /api/trainings/:id` - Get training details
- `GET /api/trainings/category/:category` - Get trainings by category

**Knowledge Hub:**
- `GET /api/knowledge` - List all articles
- `GET /api/knowledge/:id` - Get article details
- `GET /api/knowledge/category/:category` - Get articles by category
- `GET /api/knowledge/search?q=query` - Search articles

**Tools:**
- `GET /api/tools` - List all tools
- `GET /api/tools/:id` - Get tool details

**Community:**
- `GET /api/community/links` - Get community links (Skool, Slack)

**Contact:**
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

### Step 3: Frontend Development (TDD)

**For Each Page:**

1. **Write Component Tests First (RED)**
   - Create test: `frontend/src/pages/__tests__/Home.test.tsx`
   - Test component rendering
   - Test user interactions

2. **Implement Components (GREEN)**
   - Create page component
   - Create API service layer
   - Implement minimal UI to pass tests

3. **Refactor**
   - Improve UI/UX
   - Ensure tests pass

**Pages to Create:**
- `frontend/src/pages/Home.tsx`
- `frontend/src/pages/Training.tsx`
- `frontend/src/pages/KnowledgeHub.tsx`
- `frontend/src/pages/Tools.tsx`
- `frontend/src/pages/Community.tsx`
- `frontend/src/pages/Contact.tsx`

**API Service Layer:**
- `frontend/src/services/api/trainingService.ts`
- `frontend/src/services/api/knowledgeService.ts`
- `frontend/src/services/api/toolService.ts`
- `frontend/src/services/api/contactService.ts`

## Immediate Next Steps

### 1. Start with Database Schema (Today)

**Action Items:**
1. Review requirements for each Phase 1 feature
2. Design database schema
3. Write repository tests (TDD)
4. Create Prisma models
5. Run migrations
6. Implement repositories

**Estimated Time**: 2-3 hours

### 2. Build Home Page API (Next)

**Action Items:**
1. Write tests for home page data endpoints
2. Create routes for featured content
3. Implement services
4. Test API endpoints

**Estimated Time**: 1-2 hours

### 3. Build Home Page Frontend (Next)

**Action Items:**
1. Write component tests
2. Create Home page component
3. Integrate with API
4. Style with Tailwind

**Estimated Time**: 2-3 hours

## Development Workflow

For each feature:

```bash
# 1. Write tests first (RED)
cd backend
npm test -- --watch training.test.ts

# 2. Implement to pass (GREEN)
# Write code until tests pass

# 3. Refactor
# Improve code, ensure tests still pass

# 4. Run full test suite
npm test

# 5. Build frontend tests
cd ../frontend
npm test -- --watch Home.test.tsx

# 6. Implement frontend
# Write component until tests pass

# 7. Verify everything works
npm run build
```

## Key Principles

1. **TDD First**: Always write tests before implementation
2. **Database First**: Design schema before building features
3. **Backend Before Frontend**: Build APIs before UI
4. **One Feature at a Time**: Complete one feature fully before moving to next
5. **Verify with Tests**: All tests must pass before marking complete

## Questions to Answer Before Starting

1. **Content Management**: How will content be managed?
   - Admin panel?
   - Direct database?
   - CMS integration?

2. **Data Sources**: Where will initial content come from?
   - Need seed data?
   - Manual entry?

3. **Design System**: Use existing frontend template components?
   - Yes, use shadcn/ui components
   - Customize colors/branding

## Ready to Start?

**Recommended First Task**: Design and implement database schema for Phase 1 features using TDD approach.

Would you like me to:
1. Start with database schema design?
2. Begin with a specific feature (Home, Training, etc.)?
3. Create a detailed implementation plan for a specific feature?

