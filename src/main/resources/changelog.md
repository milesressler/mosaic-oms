# Changelog

## [2025-05-22]
### Fixed
- Distributor could not select an order, now modal will popup
- Non-admins could not access any APIs (manifested as no customer autofill)
- Fixed redirect loop caused by authentication race condition
- Fixed some misleading logging on backend


## [2025-05-15]
### Added
- Changelog added to navigation panel
- Checked permissions for all existing users, and added an “access denied” page for when someone needs a role (at least one)
- Item name (item admin page) can be changed now! You’ll see a warning that it will update past orders as well.
- From admin orders page, you can select an order to see the items and cancel/complete (use this until we have fillers and distributors onboarded)
- Reports page shows top 10 items previous week, and number of orders over past 8 weeks
- Slack support link in navigation - if any troubles, that’s the best way to reach out


### Changed
- Order detail view is now mobile-friendly.
- URL has been updated, and old url will redirect automatically
- Tv monitor text size and moved bus to bottom of dashboard


---
