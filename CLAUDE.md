# CLAUDE.md - Project Memory & Context

> **📝 Usage Note**: This file serves as persistent memory for Claude AI conversations. When starting a new chat session, reference this file to quickly understand the project structure, patterns, and conventions.

---

# Mosaic OMS - Order Management System

## Project Overview
**Mosaic OMS** is a comprehensive Order Management System built for Mosaic Church Austin's street ministry operations. It manages food/supply distribution with role-based workflows for order takers, fillers, runners, and distributors.

**Assessment Grade: B+ (87/100)** - Solid, production-ready application with good engineering practices.

---

## Technology Stack

### Backend (Java/Spring Boot)
- **Framework**: Spring Boot 3.3.2 with Java 17
- **Database**: MySQL with JPA/Hibernate + Flyway migrations (39 migration files)
- **Security**: Auth0 OAuth2 resource server integration
- **Real-time**: WebSocket support via STOMP protocol
- **Additional**: PDF generation (PDFBox), QR codes (ZXing), caching (Hazelcast), audit logging
- **Files**: ~171 Java source files in `src/main/java/com/mosaicchurchaustin/oms/`

### Frontend (React/TypeScript)
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Mantine v7.17.4 (comprehensive component library)
- **Routing**: React Router v6 with role-based access control
- **State Management**: React Context API for auth, preferences, features, selected orders
- **Testing**: Playwright for E2E tests across local/qa/prod environments
- **Real-time**: WebSocket integration via react-stomp-hooks
- **Analytics**: PostHog integration for user tracking
- **Files**: ~8,391 lines of frontend TypeScript/TSX code

### Infrastructure & DevOps
- **Containerization**: Docker Compose (MySQL service on port 33060)
- **Deployment**: AWS infrastructure managed via Terraform
- **Build System**: Gradle with integrated npm tasks for unified builds
- **Database**: MySQL with UTC timezone, Flyway migrations enabled

---

## Key Architecture Patterns

### Backend Structure
```
src/main/java/com/mosaicchurchaustin/oms/
├── controllers/          # REST API endpoints (@RestController)
├── services/            # Business logic layer (@Service)
├── data/
│   ├── entity/         # JPA entities (@Entity) with audit support
│   ├── request/        # API request DTOs
│   └── response/       # API response DTOs
├── security/           # Auth0 OAuth2 configuration
└── services/
    ├── audit/          # Audit logging system
    ├── labels/         # PDF generation for labels
    ├── showers/        # Shower reservation system
    └── sockets/        # WebSocket notification handlers
```

### Frontend Structure
```
frontend/src/
├── components/         # Reusable React components
├── pages/             # Route-level components
├── context/           # React Context providers (Auth, Preferences, Features)
├── services/          # API service layer
├── forms/             # Form components and validation
├── hooks/             # Custom React hooks
├── models/            # TypeScript type definitions
└── utils/             # Utility functions
```

### Entity Relationships (Key Models)
- **OrderEntity**: Core order with customer, assignee, items, history, status
- **CustomerEntity**: Customer information with UUID-based identification
- **UserEntity**: Auth0-integrated user management with roles
- **ItemEntity**: Catalog items with attributes and variants
- **OrderHistoryEntity**: Audit trail for order status changes
- **ShowerReservationEntity**: Shower booking system for street ministry
- **ChatMessageEntity**: Chat messages with sender/recipient, order references, WebSocket delivery

---

## Key Features & Workflows

### Role-Based Dashboards
1. **Customer Monitor** (`/dashboard/public`) - Public kiosk display
2. **Order Taker** (`/dashboard/taker`) - Create and edit orders
3. **Order Filler** (`/dashboard/filler`) - Pack orders with item-by-item view
4. **Runner** (`/dashboard/runner`) - Transport orders
5. **Distributor** (`/dashboard/distributor`) - Final distribution
6. **Showers Dashboard** (`/dashboard/showers`) - Manage shower reservations

### Order Lifecycle
```
PENDING_ACCEPTANCE → IN_PROGRESS → READY → COMPLETED
                  ↘ CANCELLED
```

### Real-time Features
- WebSocket notifications for order status changes
- Live dashboard updates across all user roles
- Assignment notifications when orders are claimed
- **Chat System**: Global and direct messaging with real-time delivery

---

## Development Commands

### Backend (Gradle)
```bash
./gradlew bootRun                    # Start backend (dev profile)
./gradlew buildProdJar              # Production build
./gradlew buildAndBootRun           # Build frontend + start backend
```

### Frontend (npm)
```bash
cd frontend/
npm run dev                         # Development server (localhost:5173)
npm run build                       # Production build
npm run buildForBoot               # Build for Spring Boot integration
```

### Testing
```bash
cd frontend/
npm run test:local                  # Playwright tests (local)
npm run test:qa                     # Playwright tests (QA)
npm run test:prod                   # Playwright tests (production)
```

### Database
- Local: MySQL via Docker Compose on port 33060
- Migrations: Flyway (`src/main/resources/db/migration/`) - Currently ~40 migration files
- Dev profile uses `ddl-auto: validate`

---

## Configuration & Environment

### Key Configuration Files
- `build.gradle` - Gradle build configuration with Spring Boot and npm integration
- `application.yml` - Multi-profile Spring configuration (dev/prod)
- `compose.yaml` - MySQL Docker service configuration
- Frontend uses Vite with environment-based configuration (.env files)

### Auth0 Integration
- Dev: `dev-milessmiles.auth0.com`
- Prod: `mosaicchurch.us.auth0.com`
- JWT-based authentication with role-based authorization

### API Structure
- Base path: `/api`
- WebSocket: STOMP over WebSocket with Auth0 token authentication
- Real-time notifications for order changes, assignments, and status updates

### Chat System Architecture
**Database Migration**: `V00038__add-chat-messages.sql` creates chat_messages table
**Backend Components**:
- `ChatMessageEntity` - JPA entity extending BaseUuidEntity (VARCHAR(255) UUID storage)
- `ChatController` - REST endpoints (direct return types, no ResponseEntity wrappers)
- `ChatService` - Business logic with order reference detection (`#123` pattern)
- `ChatNotifier` - WebSocket delivery using Auth0 externalId for channels

**Frontend Components**:
- `ChatSidebar` - Main chat UI (embedded in AppShell aside)
- `ChatIconWithNotifications` - Badge system (red for DMs, blue for global, iPhone-style)
- `OrderTaggingTip` - Dismissable tip with 30-day cookie persistence
- `TimeAgo` - Real-time timestamp updates (every second)
- `OrderPreview` - Inline order context cards

**WebSocket Channels**:
- Global: `/topic/chat/global`
- Direct Messages: `/topic/chat/dm/{auth0-external-id}`

**Key Features**:
- Order references: Type `#123` to auto-link orders with preview cards
- Real-time delivery with optimistic updates
- Unread message notifications with badge indicators
- Global and direct messaging tabs

---

## Code Quality Notes

### Strengths ✅
- Clean architecture with proper separation of concerns
- Comprehensive TypeScript usage on frontend
- Role-based security implementation
- Real-time capabilities with WebSocket
- Audit trail system for all changes
- E2E test coverage across environments
- Infrastructure as Code with Terraform

### Improvement Areas ⚠️
- Limited unit/integration test coverage (primarily E2E)
- Minimal code comments and API documentation
- Some endpoints could use enhanced validation
- Frontend state management could be more centralized

### Development Conventions
- Backend: Spring Boot conventions, Lombok for boilerplate reduction
- Frontend: Mantine component library, Context for state management
- Database: UUID primary keys for entities, audit logging on all changes
- API: RESTful design with clear request/response DTOs

### Coding Standards & Best Practices
- **Java**: No star imports (import specific classes), finalize variables when possible
- **TypeScript**: Always add explicit types, avoid any types
- **Security**: Add new endpoints to security config or they will be blocked
- **Git**: Stage all new files when creating them
- **Auditing**: Only implement Auditable interface when audit logging is actually needed
- **Database**: Consistent VARCHAR(255) for UUID storage across all entities
- **WebSocket**: Use Auth0 externalId (not UUID) for user-specific channels
- **Controller Pattern**: Prefer direct return types over ResponseEntity wrappers

---

## Quick Reference

### Common File Locations
- Main Application: `src/main/java/com/mosaicchurchaustin/oms/MosaicOmsApplication.java`
- Route Configuration: `frontend/src/routesConfig.tsx`
- API Controllers: `src/main/java/com/mosaicchurchaustin/oms/controllers/`
- Frontend Pages: `frontend/src/pages/`
- Database Migrations: `src/main/resources/db/migration/`

### Important Context Providers
- `AuthContextProvider` - User authentication and tokens
- `FeaturesProvider` - Feature flag system
- `PreferencesProvider` - User preferences
- `SelectedOrderProvider` - Order workflow state management

---

*Last Updated: 2025-09-04*
*Project Assessment: B+ (87/100) - Production-ready with room for testing improvements*