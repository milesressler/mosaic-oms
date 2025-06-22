# Changelog

## [2025-06-19]

### Added
- Showers dashboard done, widget on customer monitor hidden until approved
- Only My Orders button on orders page filters to order the current users has touched
- Filter to query order by numeric ID
- Edit customers flow intended for order takers (click pencil icon in orders page)

### Changed
- Moved orders closed toggle to order taker view

### Fixed
- Permissions issue 
- Fixed user role management not appearing on some browsers

## [2025-06-12]

### Added
- Finished label printing with QR code scanning in dashboards
- Fallback page when service has not yet started up
- Toggle to enable/disable order acceptance
- Item attributes on order details page
- Customer search and sorting

### Fixed
- Navigation bar issues
- Customer search filters


## [2025-06-05]

### Added
- Customer details page
- Flagging a customer (shows on customer search)
- Log shower waiver signed date

## [2025-05-29]

### Added
- Report a bug from left navigation panel

### Changed
- Order filler shows avatar but not name - name is visible with long tap on avatar
- Made order taker buttons sticky to bottom with extra padding on some devices
- Grouped bulk update notifications into one so as not to flood the UI
- Added right padding to filler modal so to help prevent erroneous touches to completion of items
- Added last status change user to runner view
- Customer and Order search moved to non-admin group
- Filler dashboard and modal gets update in real-time when assignee changes


## [2025-05-22]
### Fixed
- Distributor could not select an order, now modal will popup
- Non-admins could not access any APIs (manifested as no customer autofill)
- Fixed redirect loop caused by authentication race condition
- Fixed some misleading logging on backend
- Sometimes notifications would not work, this should happen less often
- Fixed Distributor and Runner dashboard not refreshing after changes
- Fixed some status display bugs


### Changed
- User accounts(Gmail and username/password) are linked by email - meaning, you only need to know the email address to update roles
- Added better logging and debugging tools

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
