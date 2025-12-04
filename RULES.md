# Project Rules & Guidelines

## Changelog Management

### Update Frequency
- **Weekly entries**: Create a new dated section once per week (e.g., `## [2025-11-18]`)
- **Regular updates**: Most changes should be documented unless they are very minor
- **Customer-facing**: Write entries for end users, not just developers

### What to Include
- New features and functionality
- UI/UX improvements and changes
- Bug fixes that affect user experience
- Performance improvements
- Role or permission changes

### What to Exclude (minor changes)
- Typo fixes in code comments
- Internal refactoring without user impact
- Development tooling updates
- Very small CSS adjustments

### Format Guidelines
- Follow existing pattern: `Added`, `Changed`, `Fixed`, `Improvements`
- Use bullet points with descriptive but concise language
- Include technical details for advanced users when relevant
- Group related changes under appropriate sections

### Location
- File: `src/main/resources/changelog.md`
- This file gets parsed and displayed to users in the application

## Development Workflow

### Before Committing
- Review if your changes warrant a changelog entry
- Add entry to current week's section
- If no section exists for current week, create one

### Commit Messages
- Write clear, descriptive commit messages
- These may be used to generate changelog entries later

---

## Code Quality & Standards

### Java/Spring Boot Backend
- No star imports - import specific classes only
- Finalize variables when possible (`final String name = ...`)
- Add new endpoints to security config or they will be blocked by default
- Only implement `Auditable` interface when audit logging is actually needed
- Use `VARCHAR(255)` for UUID storage across all entities for consistency
- Prefer direct return types over `ResponseEntity` wrappers in controllers

### Frontend (React/TypeScript)
- Always add explicit types - avoid `any` types
- Follow Mantine component library patterns
- Use existing Context providers for state management
- Maintain existing file structure and naming conventions

### Database
- All new migrations go in `src/main/resources/db/migration/`
- Use Flyway naming: `V{number}__{description}.sql`
- Test migrations on local database before committing
- Always use UTC timezone considerations

## Development Workflow

### File Management
- Prefer editing existing files over creating new ones
- Only create new files when necessary for the feature

### Testing & Quality
- If commands aren't clear, add them to `CLAUDE.md` for future reference
- Frontend: `npm run dev` in `/frontend` directory

### Security Best Practices
- Never commit secrets, API keys, or credentials
- Never log sensitive information
- Follow Auth0 integration patterns for authentication
- Use role-based access control consistently

## Agentic Coding Guidelines

### When Working with AI Assistants
- Reference `CLAUDE.md` for project context and patterns
- Always check existing code patterns before implementing new features
- Verify library availability in `package.json`/`build.gradle` before using
- Follow the established architecture (Controllers → Services → Data layers)
- Use WebSocket patterns for real-time features
- Maintain consistent error handling patterns

### Code Review & Changes
- Check that changes follow existing conventions
- Ensure new features integrate with role-based dashboards
- Test real-time features across different user roles
- Verify database changes don't break existing migrations

### Communication
- Update `CLAUDE.md` with significant architectural changes
- Document any new patterns or conventions discovered
- Note any technical debt or areas needing future attention

---

*These rules help maintain code quality and consistency while enabling effective collaboration with AI development tools.*