# AI Forge Hub - Updated Requirements Understanding

## Website Type
**Landing Page / Marketing Funnel with Admin CMS**

This is NOT a full platform, NOT a course marketplace, NOT a SaaS product.

It is a **content management system for a marketing funnel** that:
- Showcases content (trainings, tools, products, articles)
- Routes users to external platforms (YouTube, LinkedIn, X, Skool, etc.)
- Has an admin panel to manage content
- Uses RBAC for admin access

## Architecture

### Public Pages (No Auth Required)
- **Home** - Hero, featured content, CTAs
- **Training** - List of trainings with external links
- **Knowledge Hub** - Articles/blog posts
- **Tools** - Tool walkthroughs with external links
- **Products** - SaaS product showcase with external links
- **Community** - Links to Skool, Slack, etc.
- **Internships** - Information page with CTA
- **Enterprise** - B2B page with contact form
- **Contact** - Contact form and newsletter signup

### Admin Panel (Auth + RBAC Required)
- **Content Management** - CRUD for:
  - Trainings (with external links)
  - Knowledge articles
  - Tools (with external links)
  - Products (with external links)
  - Community links
  - Blog posts/articles

### User Flow
1. Visitor lands on public page
2. Views content (trainings, tools, products)
3. Clicks CTA → Redirected to external platform (YouTube, Skool, etc.)
4. Admin logs in → Manages content via admin panel

## Database Schema (Simplified)

### Content Models
All content items have:
- Basic info (title, description, image)
- External link (where user is redirected)
- Status (active/inactive)
- Featured flag
- Order/position for display
- Metadata (category, tags, etc.)

### Models Needed

**Training**
- title, description, image
- category (INTRODUCTORY, NICHE_TOPICS, TOOL_BASED, etc.)
- level (BEGINNER, INTERMEDIATE, ADVANCED)
- externalLink (YouTube, course platform, etc.)
- duration, price (display only)
- featured, isActive, displayOrder

**Knowledge Article**
- title, description, content (markdown)
- category (GLOSSARY, CONCEPTS, BEST_PRACTICES, etc.)
- readTime, image
- externalLink (optional - if hosted elsewhere)
- featured, isActive, displayOrder

**Tool**
- title, description, image
- problemSolved, whoShouldUse
- externalLink (tool website, tutorial, etc.)
- relatedTrainingIds (array)
- featured, isActive, displayOrder

**Product**
- title, description, image
- problemSolved, status (LIVE, BETA, COMING_SOON)
- externalLink (product website)
- pricing (display only)
- featured, isActive, displayOrder

**Community Link**
- platform (SKOOL, SLACK, etc.)
- title, description
- externalLink (join link)
- isActive, displayOrder

**Contact Submission**
- name, email, message, subject
- createdAt

**Newsletter Subscription**
- email, source (which page)
- subscribedAt, isActive

## API Endpoints

### Public Endpoints (No Auth)
- `GET /api/content/trainings` - List all active trainings
- `GET /api/content/trainings/:id` - Get training details
- `GET /api/content/trainings/featured` - Get featured trainings
- `GET /api/content/knowledge` - List articles
- `GET /api/content/knowledge/:id` - Get article
- `GET /api/content/tools` - List tools
- `GET /api/content/tools/:id` - Get tool
- `GET /api/content/products` - List products
- `GET /api/content/community` - Get community links
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

### Admin Endpoints (Auth + Admin Role Required)
- `GET /api/admin/trainings` - List all (including inactive)
- `POST /api/admin/trainings` - Create training
- `PUT /api/admin/trainings/:id` - Update training
- `DELETE /api/admin/trainings/:id` - Delete training
- (Same pattern for knowledge, tools, products, etc.)

## RBAC Usage

**Already Implemented in Template:**
- `authenticate` middleware - Verifies JWT token
- `requireRole` middleware - Checks user role
- Roles: USER, ADMIN, SUPER_ADMIN

**Usage:**
```typescript
// Admin routes
router.use(authenticate);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));
```

## Implementation Plan

### Phase 1: Database Schema (TDD)
1. Write tests for content models
2. Create Prisma schema
3. Run migrations
4. Implement services

### Phase 2: Public API (TDD)
1. Write tests for public endpoints
2. Implement routes/services
3. Test redirects work

### Phase 3: Admin API (TDD)
1. Write tests for admin endpoints
2. Implement with RBAC
3. Test admin access control

### Phase 4: Frontend (TDD)
1. Public pages (no auth)
2. Admin panel (with auth)
3. Content management UI

## Key Differences from Original Plan

**Before (Wrong Understanding):**
- Complex training system
- User accounts for learners
- Payment processing
- Full LMS features

**Now (Correct Understanding):**
- Simple content management
- External links/redirects
- Admin panel for content CRUD
- Public pages for display
- Lead capture (contact, newsletter)

## Next Steps

1. Delete the complex training service tests I just created
2. Create simplified content management schema
3. Write tests for content models (TDD)
4. Implement content services
5. Build public and admin APIs

