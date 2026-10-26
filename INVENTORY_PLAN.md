# Inventory Tracking Plan

## Goal
Replace the stakeholder's manual Chromebook workbook for a few key items (men's jeans, backpacks,
men's shoes) with stock counts in OMS:

- Admins turn on **Track inventory** per item. Most items stay untracked.
- Stock is counted per **variant**: jeans by waist x length, shoes by size, backpacks as one number.
- Order takers see at the point of order whether the requested variant is in stock and can offer
  another size. Out of stock is a **warning, never a block**: the order still goes in, so the
  need is on record.
- Stock goes down by itself when orders are packed. The weekly human work is a recount and logging
  deliveries, done on one screen instead of a spreadsheet.
- Requested vs filled vs on-hand per size becomes the data for buying jeans.

## Decisions
- **Opt-in per item.** `items.track_inventory`. Untracked items behave exactly as today.
- **What a variant is.** The combination of the item's options that split stock. The admin marks
  which `SINGLE_SELECT` attributes do this ("Track stock by this option"), defaulting to every
  required single-select. Multi-select and text attributes never split stock (e.g. a "notes" or
  "color preference" field). Tracked attributes become required, so every order line maps to
  exactly one variant. An item with no tracked attributes has a single stock count.
- **Variant key.** A canonical string built from the same slugs already stored in
  `order_items.attributes`, sorted by attribute slug: `length=32|waist=30`. Empty string for an
  item with no variants. Matching an order line to its stock row is a string compare, no joins.
- **Missing row = 0.** With tracking on, every combination exists in the UI. A row is written the
  first time a count is entered.
- **Flexible entry over complete entry.** A small nonprofit will not fill in every detail. Stock is
  entered the same way orders are taken (quick add), only for what's on hand, and anything they
  can't size goes to an explicit Unsorted bucket instead of being rejected.
- **When stock moves: at PACKED**, using `quantity_fulfilled` (falling back to `quantity`, the same
  rule reports use). That is when items leave the shelf. Taking the order does not move stock.
  Confirmed with the stakeholder: stock always leaves at packing.
- **Cancelled orders return stock.** Orders are sometimes packed, taken to distribution, and
  cancelled when nobody picks them up; those items go back on the shelf. So a CANCELLED (or
  REJECTED) order returns everything it deducted, automatically.
- **Reconcile, don't increment.** On every status change, an order's tracked lines are reconciled:
  the target deduction is `fulfilled` while the order is PACKED or later (not CANCELLED/REJECTED),
  and 0 otherwise. The ledger already knows what was deducted for each order line, so the
  difference is written as one adjustment. Reopening, re-packing with other quantities, cancelling
  after packing, and editing an order all come out right, and running it twice is a no-op.
- **Committed vs available** (Shopify's model). `committed` = units requested on open orders not
  yet packed. Order takers see `available = on_hand - committed`. Computed live, never stored.
- **Negative stock is allowed** and shown in red as "count is off, recount". Blocking a filler
  from packing a pair of jeans they are holding because a spreadsheet said zero would be worse.
- **Derived availability.** For tracked items, "out of stock" comes from the counts: an item with
  every variant at 0 available shows as out. The manual Available/Unavailable toggle and per-option
  `available` flags stay for untracked items; for tracked items the table shows stock instead.
  `DISCONTINUED` stays manual.
- **Snapshot at order time.** Like `limit_snapshot`: store what the order taker saw on each tracked
  line, so fillers know the taker already flagged it and reports can count unmet demand.
- **Public monitor never shows stock.**

## Data model (migration V00054)
`items`:
- `track_inventory TINYINT(1) NOT NULL DEFAULT 0`
- `low_stock_threshold INT NULL`: optional, at or below this a variant shows "Low"

`item_attributes`:
- `tracks_stock TINYINT(1) NOT NULL DEFAULT 0`

`inventory_levels` (current count):
- `id`, `created`, `updated`
- `item_entity_id BIGINT NOT NULL` FK items
- `variant_key VARCHAR(255) NOT NULL`
- `on_hand INT NOT NULL`
- `UNIQUE (item_entity_id, variant_key)`

`inventory_adjustments` (ledger, append-only, also the audit trail):
- `id`, `created`
- `item_entity_id`, `variant_key`
- `delta INT NOT NULL`, `on_hand_after INT NOT NULL`
- `reason VARCHAR(32)`: `COUNT` (stocktake, "set to"), `RECEIVED` (delivery), `ORDER` (packing
  reconcile), `CORRECTION` (damaged, lost, given out off-system)
- `order_item_id BIGINT NULL` FK order_items (set for `ORDER`)
- `note VARCHAR(255) NULL`, `created_by BIGINT NULL` FK users
- Index `(order_item_id)` for reconcile, `(item_entity_id, created)` for history

`order_items`:
- `stock_snapshot JSON NULL`:
```json
{ "variantKey": "length=32|waist=30", "onHand": 0, "committed": 1, "available": -1,
  "evaluatedAt": "2026-10-26T15:04:00Z", "outOfStock": true }
```

Count updates use `UPDATE ... SET on_hand = on_hand + :delta` (or an upsert) in the same
transaction as the ledger insert, so two fillers packing at once can't lose an update.

## Backend
- `ItemEntity`: `trackInventory`, `lowStockThreshold`; add both to `getCurrentState()`.
  `ItemAttribute`: `tracksStock`.
- `VariantKeys` util: build a key from attribute slugs + option slugs, from an order line's
  attribute map, and list every combination for an item.
- `InventoryService`:
  - `getLevels(itemIds)`: on hand + committed per variant (one grouped query over open order lines).
  - `adjust(itemId, List<{variantKey, mode SET|ADD, quantity, reason, note}>)`: batch, one ledger
    row per changed cell.
  - `reconcileOrder(order)`: called from `OrderService` on every status change and order edit.
  - `snapshot(order)`: write `stock_snapshot` on order create/edit, next to the limit snapshot.
- Item update: when tracked attributes or their options change, rows whose key no longer
  matches any combination are kept and returned as **retired variants**, so stock never vanishes
  silently. (Renaming an option changes its slug, since `syncItemAttributes` keys on slugs.)
- Endpoints (add to security config; any admin can edit counts):
  - `GET  /api/inventory?category=`: tracked items with levels, for the Inventory page
  - `GET  /api/inventory/items/{id}`: levels + retired variants for one item
  - `POST /api/inventory/items/{id}/adjustments`: batch set/add
  - `GET  /api/inventory/items/{id}/adjustments?page=`: ledger
  - `GET  /api/items/stock`: compact `{itemId: {variantKey: available}}` for the order form
- `SuggestedItemResponse` / `AdminItemResponse`: `trackInventory`, tracked attribute slugs,
  `stockStatus` (IN / LOW / OUT). `OrderItemResponse`: `stockSnapshot`.
- WebSocket: publish stock changes on the existing item/order topics so open order forms refresh.

## Frontend

### Admin: one "Items" area, two tabs
Not a separate app; the catalog and inventory share one place, similar to Shopify's Products and
Inventory.

**Catalog tab** (today's `ItemsManagementPage`):
- New **Stock** column: "24 in stock", orange "Low", red "Out", or "-" for untracked.
  Replaces the availability toggle for tracked items.
- Filter: "Tracked only".
- Clicking an item opens a full **item page** (`/admin/items/:id`) instead of the modal. The form
  is already 700 lines and inventory would make the modal too cramped. Sections:
  1. Details (name, category, placeholder)
  2. Options (attributes and groups, as today, plus "Track stock by this option" per single-select)
  3. Limits (as today)
  4. **Inventory**: the "Track inventory" switch, low-stock threshold, the stock grid (below),
     and recent activity from the ledger.

**Inventory tab** (`/admin/inventory`): the weekly workspace that replaces the workbook.
- Lists tracked items only, each with total on hand, number of out-of-stock variants, and
  last counted date.
- Expanding an item shows its **stock grid**:
  - 0 tracked attributes: one number.
  - 1 attribute (shoe size): one row of sizes.
  - 2 attributes (jeans): a **matrix**, waist down the side and length across the top, which is
    probably what the workbook already looks like.
  - 3 or more: a flat list of combinations.
- Cells show on hand, with committed in small text and colors for low, out, and negative.
- A mode switch above the grid:
  - **Count** ("set to"): type what is on the shelf. Saved as `COUNT`.
  - **Receive** ("add"): type what arrived. Saved as `RECEIVED`.
  - **Correct**: +/-, with a required note.
- Edits are staged with the changed cells highlighted ("12 changes"), then saved as one batch.
  Changing your mind before saving costs nothing.
- **Paste from spreadsheet** into the matrix for the first load from the workbook.
- Retired variants are listed under the grid with a "Zero out" action.
- **Quick add** (the primary way to enter stock; the grid is for the weekly recount). Same
  interaction as order taking: pick the item, pick options with the same dropdowns
  (`OrderItemFormV2`), enter a quantity, choose Received / Count / Correct, and add another line.
  Lines collect into a list ("3 lines, 14 units") and save as one batch. Nobody has to face a full
  matrix to log a bag of donated jeans.
  - **Nothing to set up first.** Missing rows count as 0, so an admin only ever enters the
    variants they have. Empty cells in the grid are fine.
  - **New sizes inline.** If a size isn't in the list yet, typing it in the dropdown offers
    "Add 34 as a new waist option", which adds the option to the item.
  - **Unsorted.** If a tracked option is left blank, the units go to the item's **Unsorted** bucket
    (`variant_key = '?'`). It counts toward the item total and shows in the grid as its own row
    with a "Sort" action that moves units into real sizes. Order takers see it as "plus 5 unsorted,
    check the shelf" rather than "out". The data stays honest: unknown is labelled unknown, never
    guessed.
- **Turning on tracking needs one decision**, not a form: the switch defaults "Track stock by"
  to the item's required dropdowns, so most items need no further setup.

### Order taker (`ItemSelection`, `OrderItemFormV2`, `OrderFormV2`)
- Fetch `/api/items/stock` with the catalog; refresh on the WebSocket event.
- Item card: a small "Out" or "Low" chip for tracked items. Nothing for untracked items.
- Size dropdowns show stock: `32 (4)`, or `30 (out)` greyed but still selectable. For two
  attributes, the counts shown for the second depend on the first choice.
- When the chosen variant is out: an orange alert in the item modal:
  > **30 x 32 is out of stock.** Ask if another size works: **30 x 30** (3), **31 x 32** (2).
  > You can still add it and it will be recorded as a need.

  Suggestions are in-stock variants that differ by one attribute, closest first. Tapping one
  switches the selection.
- Confirm step lists out-of-stock lines, the same way it lists over-limit items.

### Filler (`PackingView`, `OrderItemListView`) and order details
- Chip from `stock_snapshot`: "Out of stock when ordered". The filler knows the customer was told
  and records 0 fulfilled. Packing and its quantities drive the deduction; there is no new step.

### Reports (phase 2)
- Item Analysis already breaks down by size. Add on hand, and **unmet demand** (requested minus
  fulfilled, and lines ordered while out) per variant over a date range, as a "what to buy" view
  for jeans. The existing size filter on the orders page answers "who asked for 30x32?".

## Edge cases
- **Tracking turned on for an item with open orders:** no backfill. Reconcile starts with the next
  status change, so an order packed before tracking was enabled is not deducted retroactively.
- **Order edited after packing:** reconcile on edit nets the difference.
- **Line without the tracked option** (orders placed before the option was required): shown as
  "size not specified" and not deducted. Rare, and visible in the ledger by its absence.
- **Concurrent counts:** "set to" records the delta against the value at save time and warns if
  the cell changed since the page loaded (a packed order landed in between), with the option to
  keep the typed number.
- **Quantity > 1 on a line:** compared against available.

## Phasing
1. **Data model + admin:** migration, toggle, tracked attributes, Inventory tab with quick add and
   grid, Count/Receive/Correct, Unsorted bucket, ledger, paste import. She can stop using the workbook for counts.
2. **Order flow:** order-taker stock display and suggestions, snapshot, reconcile on PACKED,
   committed counts, derived availability, item page replacing the modal.
3. **Reporting + nice-to-haves:** demand vs stock report, low-stock notification to admins,
   "last counted" reminders.

Phases 1 and 2 can ship together. Phase 1 alone is still useful and has no risk to order taking.

## Resolved
- Stock leaves the shelf at packing, always.
- Cancelling an order after packing returns its items to stock automatically.
- Any admin can edit counts.

## Open questions for the stakeholder
- Roughly how many jeans sizes are stocked? Decides whether the matrix needs to hide empty
  rows and columns.

*Created: 2026-10-26*
