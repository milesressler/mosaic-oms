# Limited Items Plan

Supersedes `RESTRICTED_ITEMS_PLAN.md` (2025-12-04, never implemented).

## Goal
Admins can mark an item as a **Limited item** with a rule like "1 per year" or "2 per month".
Order takers and fillers see the customer's status for that item (last received, how many in the
current period, when they're eligible again). Being over the limit is a **warning, never a block**:
the order taker can still add the item and use the existing order notes if they want to explain.

## Decisions
- **Rule shape:** N per period. `limit_quantity` units per `limit_period_value` `limit_period_unit`.
- **What counts:** `order_items.quantity_fulfilled` on **COMPLETED** orders only. Completion time is
  the COMPLETED status-change timestamp in `order_history` (there is no `orders.completion_date`).
- **Window types:**
  - `ROLLING`: the last N days/weeks/months/years from the evaluation time.
  - `CALENDAR`: fixed periods that reset on boundaries (calendar week/month/quarter/year), with an
    optional `limit_period_start_month` for seasons (e.g. "1 per 1 year starting October").
    Boundaries are computed in America/Chicago, not UTC.
- **Scope:** per item only. Item groups ("any jacket") are a future enhancement.
- **Not doing:** override reason prompt (general notes field covers it), open/in-progress order
  checks (rare; edits are the norm), duplicate-customer detection.
- **Snapshot at order time:** rules will change, so recalculating old orders against the current
  rule would show wrong information. The status is computed and saved as JSON on each limited
  order item when the order is created or edited.

## Data model (migration V00052)
`items`, all nullable (null `limit_quantity` = not limited):
- `limit_quantity INT`
- `limit_period_value INT`
- `limit_period_unit VARCHAR(16)` (`WEEK` | `MONTH` | `YEAR`)
- `limit_window VARCHAR(16)` (`ROLLING` | `CALENDAR`)
- `limit_period_start_month TINYINT` (calendar only, 1-12, default January)

`order_items`:
- `limit_snapshot JSON` (null for non-limited items and for orders placed before this feature)

Snapshot shape:
```json
{
  "rule": { "quantity": 1, "periodValue": 1, "periodUnit": "YEAR", "window": "CALENDAR", "startMonth": 10 },
  "evaluatedAt": "2026-10-18T15:04:00Z",
  "periodStart": "2025-10-01T05:00:00Z",
  "receivedInPeriod": 1,
  "lastReceivedAt": "2026-01-12T17:30:00Z",
  "nextEligibleAt": "2026-10-01T05:00:00Z",
  "overLimit": true
}
```

Check indexes support the lookup: `order_items(item_entity_id)`, `order_history(order_entity_id, type)`.

## Backend
- `ItemEntity`: limit fields; add them to `getCurrentState()` so rule changes are audit logged.
- `LimitRule` value object + `ItemLimitService.evaluate(customer, items, asOf, excludeOrderId)`:
  one query per customer for the given limited items, returning the status per item.
- Order create/edit: evaluate the limited items on the order (excluding the order itself) and write
  `limit_snapshot`. On edit, re-evaluate all limited lines (an edit is a new decision by the taker).
- `GET /api/customer/{uuid}/item-limits`: live status ("as of now") for the order form and the
  customer page. Add to security config.
- Item admin update: accept and validate the limit fields.
- `SuggestedItemResponse` / `AdminItemResponse`: include the rule.
- `OrderItemResponse`: include `limitSnapshot`.

## Frontend
- **Admin items page:** "Limited item" toggle -> "[N] per [value] [unit]", Rolling/Calendar choice,
  "starting [month]" when Calendar. Badge in the items table.
- **Order form (`OrderFormV2` / `ItemSelection`):** on entering the items step for an existing
  customer, fetch `/customer/{uuid}/item-limits` once and join to the catalog by item id.
  Limited items show a chip ("1 per year · last: Jan 12"); over-limit shows an orange
  "Eligible again Oct 1" warning but can still be added. Confirm step lists over-limit items.
- **Filler (`PackingView` / `OrderItemListView`) and order details page:** render the chip from
  `limitSnapshot`, so it reflects the order's moment in time. Relative text ("3 weeks ago") is
  computed client-side from the dates.
- **Customer detail page:** "Limited items" panel with live status, for walk-up "can I get a coat?"
  questions.
- **Public monitor:** never shows limit info.

## Future
- Item groups sharing one limit.
- Reporting on early or over-limit distribution, if stakeholders ever want it (the snapshot data
  already supports it).

*Created: 2026-10-18*
