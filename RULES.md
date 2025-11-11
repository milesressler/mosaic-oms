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

*These rules help maintain clear communication with our users about system updates and improvements.*