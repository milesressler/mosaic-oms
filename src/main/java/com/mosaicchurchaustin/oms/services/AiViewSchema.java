package com.mosaicchurchaustin.oms.services;

import java.util.List;

/**
 * Single source of truth for the AI agent's view of the database.
 *
 * Each constant describes one view the oms_ai_agent user can access.
 * - viewName   matches the SQL view name in V00048__ai-query-views.sql
 * - purpose    is a one-line description sent to the AI in the system prompt
 * - columns    are sent as the schema; the name must exactly match the DB column
 *
 * AiSchemaValidator checks these column names against INFORMATION_SCHEMA at
 * startup and warns if they drift from the actual view definition.
 */
public enum AiViewSchema {

    V_ORDER_SUMMARY(
            "v_order_summary",
            "One row per order. Use for order counts, status breakdowns, and assignee queries.",
            List.of(
                    col("order_db_id",         "BIGINT",   "Numeric primary key — use for JOINs to v_order_history"),
                    col("order_id",            "VARCHAR",  "Opaque UUID — join key to v_order_items_detail"),
                    col("created_at",          "DATETIME", "When the order was placed (UTC)"),
                    col("order_status",        "VARCHAR",  "PENDING_ACCEPTANCE (new, unclaimed) | IN_PROGRESS (being filled) | READY (packed) | COMPLETED (delivered) | CANCELLED"),
                    col("assignee_name",       "VARCHAR",  "Staff member who claimed the order, or 'Unassigned'"),
                    col("special_instructions","VARCHAR",  "Free-text note from the customer; often NULL")
            )
    ),

    V_ORDER_ITEMS_DETAIL(
            "v_order_items_detail",
            "One row per line item. Use for item-level analysis, fulfillment rates, and item-by-customer queries.",
            List.of(
                    col("order_db_id",        "BIGINT",   "Numeric order primary key — joins to v_order_summary.order_db_id and v_order_history.order_db_id"),
                    col("order_id",           "VARCHAR",  "Joins to v_order_summary.order_id"),
                    col("order_created_at",   "DATETIME", "When the order was placed (UTC)"),
                    col("order_status",       "VARCHAR",  "Same values as v_order_summary.order_status"),
                    col("order_item_id",      "BIGINT",   "Primary key of the order line item"),
                    col("item_id",            "BIGINT",   "Joins to v_items.id and v_item_attributes.item_id"),
                    col("item_name",          "VARCHAR",  "Exact item name as stored, e.g. \"Men's Jeans\". Use LIKE '%keyword%' for fuzzy search"),
                    col("item_category",      "VARCHAR",  "Grouping category such as 'CLOTHING', 'FOOD', 'HYGIENE'; may be NULL"),
                    col("quantity",           "INT",      "Number of this item requested"),
                    col("quantity_fulfilled", "INT",      "Number actually packed; may be NULL or less than quantity if order is incomplete"),
                    col("notes",             "VARCHAR",  "Free-text note on this specific line item; often NULL"),
                    col("attributes",        "JSON",     "JSON map of attribute selections made at order time, e.g. {\"size\": \"L\"}; may be NULL")
            )
    ),

    V_ITEMS(
            "v_items",
            "The managed item catalog. Use to look up exact item names, browse categories, or join to attribute views. Only includes managed=true items.",
            List.of(
                    col("id",          "BIGINT",   "Primary key — joins to v_order_items_detail.item_id and v_item_attributes.item_id"),
                    col("created",     "DATETIME", "When the item was added to the catalog (UTC)"),
                    col("updated",     "DATETIME", "When the item was last modified (UTC)"),
                    col("item_name",   "VARCHAR",  "Exact item name used in orders"),
                    col("category",    "VARCHAR",  "Item grouping: CLOTHING | LINENS | HYGIENE | FIRST_AID | GEAR | ACCESSORIES; may be NULL"),
                    col("availability","VARCHAR",  "AVAILABLE (currently offered) | UNAVAILABLE (discontinued or out of stock)")
            )
    ),

    V_SHOWER_ACTIVITY(
            "v_shower_activity",
            "Shower reservation activity. Use for shower usage counts, wait times, and duration analysis.",
            List.of(
                    col("created_at",         "DATETIME", "When the reservation was created (UTC)"),
                    col("started_at",         "DATETIME", "When the shower session began; NULL if not yet started"),
                    col("ended_at",           "DATETIME", "When the shower session ended; NULL if still in progress"),
                    col("reservation_status", "VARCHAR",  "WAITING (in queue) | IN_PROGRESS (currently showering) | COMPLETED | CANCELLED"),
                    col("shower_number",      "INT",      "Which shower unit (1, 2, etc.)"),
                    col("duration_minutes",   "INT",      "Computed from started_at to ended_at; NULL if not yet completed")
            )
    ),

    V_DAILY_ORDER_COUNTS(
            "v_daily_order_counts",
            "Pre-aggregated daily order totals. Prefer this over counting v_order_summary for trend queries.",
            List.of(
                    col("date",        "DATE", "Calendar date"),
                    col("order_count", "INT",  "Total orders created on that date")
            )
    ),

    V_WEEKLY_ITEM_REQUESTS(
            "v_weekly_item_requests",
            "Pre-aggregated weekly item request counts. Prefer this over aggregating v_order_items_detail for weekly trends.",
            List.of(
                    col("week_start",    "DATE",    "The Sunday that starts the week"),
                    col("item_name",     "VARCHAR", "Item description"),
                    col("request_count", "INT",     "Total times this item appeared across all orders that week")
            )
    ),

    V_PROCESS_TIMINGS(
            "v_process_timings",
            "Week-over-week average processing times for order intake and fulfillment.",
            List.of(
                    col("week_start_date",  "DATE",   "Sunday start of the week"),
                    col("timing_type",      "VARCHAR","ORDER_TAKER_TIME (order creation → IN_PROGRESS) | FULFILLMENT_TIME (IN_PROGRESS → READY)"),
                    col("avg_time_seconds", "DOUBLE", "Average duration in seconds for that timing type that week")
            )
    ),

    V_USERS(
            "v_users",
            "Staff and volunteer user accounts. Use to look up who is assigned to orders or who made history events.",
            List.of(
                    col("id",          "BIGINT",   "Primary key — joins to v_order_history.user_id"),
                    col("uuid",        "VARCHAR",  "Opaque UUID identifier"),
                    col("external_id", "VARCHAR",  "Auth0 external identifier"),
                    col("name",        "VARCHAR",  "Display name of the user"),
                    col("username",    "VARCHAR",  "Login username"),
                    col("created",     "DATETIME", "When the account was created (UTC)")
            )
    ),

    V_ORDER_HISTORY(
            "v_order_history",
            "Order status change audit trail. Use to analyze when orders transitioned between statuses and who made the change.",
            List.of(
                    col("id",                    "BIGINT",   "Primary key of the history event"),
                    col("order_db_id",           "BIGINT",   "Joins to v_order_summary.order_db_id"),
                    col("order_id",              "VARCHAR",  "Joins to v_order_summary.order_id (UUID)"),
                    col("timestamp",             "DATETIME", "When this event occurred (UTC)"),
                    col("type",                  "VARCHAR",  "STATUS_CHANGE | EXPORT"),
                    col("order_status",          "VARCHAR",  "The status the order moved TO"),
                    col("previous_order_status", "VARCHAR",  "The status the order was before this event"),
                    col("export_type",           "VARCHAR",  "Export format if type=EXPORT; NULL otherwise"),
                    col("comment",               "VARCHAR",  "Optional note recorded with the event; often NULL"),
                    col("user_id",               "BIGINT",   "Joins to v_users.id — who triggered this event")
            )
    ),

    V_ITEM_ATTRIBUTES(
            "v_item_attributes",
            "Attribute definitions for items (e.g. size selector, color picker). Use to understand what choices exist for an item.",
            List.of(
                    col("id",          "BIGINT",   "Primary key — joins to v_item_attribute_options.item_attribute_id"),
                    col("created",     "DATETIME", "When the attribute was added (UTC)"),
                    col("updated",     "DATETIME", "When the attribute was last modified (UTC)"),
                    col("item_id",     "BIGINT",   "Joins to v_items.id"),
                    col("type",        "VARCHAR",  "Attribute input type: STRING | SIZE | MULTI_SELECT | etc."),
                    col("label",       "VARCHAR",  "Display label shown to order takers, e.g. 'Size'"),
                    col("value",       "VARCHAR",  "Slug identifier for the attribute, e.g. 'size'"),
                    col("required",    "BIT",      "1 if this attribute must be filled before submitting the order"),
                    col("group_name",  "VARCHAR",  "Optional visual group name; NULL if ungrouped"),
                    col("group_order", "INT",      "Sort order within the group; NULL if ungrouped")
            )
    ),

    V_ITEM_ATTRIBUTE_OPTIONS(
            "v_item_attribute_options",
            "Selectable option values for item attributes (e.g. S, M, L for a size attribute).",
            List.of(
                    col("id",                 "BIGINT",  "Primary key of the option"),
                    col("created",            "DATETIME","When the option was added (UTC)"),
                    col("updated",            "DATETIME","When the option was last modified (UTC)"),
                    col("item_attribute_id",  "BIGINT",  "Joins to v_item_attributes.id"),
                    col("item_id",            "BIGINT",  "Joins to v_items.id (denormalized for convenience)"),
                    col("label",              "VARCHAR", "Display label shown to order takers, e.g. 'Large'"),
                    col("value",              "VARCHAR", "Slug identifier stored in order_items.attributes JSON, e.g. 'large'"),
                    col("availability",       "VARCHAR", "AVAILABLE | UNAVAILABLE")
            )
    );

    // ---------------------------------------------------------------

    public record Column(String name, String type, String description) {}

    private final String viewName;
    private final String purpose;
    private final List<Column> columns;

    AiViewSchema(final String viewName, final String purpose, final List<Column> columns) {
        this.viewName = viewName;
        this.purpose = purpose;
        this.columns = columns;
    }

    public String getViewName()      { return viewName; }
    public String getPurpose()       { return purpose; }
    public List<Column> getColumns() { return columns; }

    public List<String> getColumnNames() {
        return columns.stream().map(Column::name).toList();
    }

    private static Column col(final String name, final String type, final String description) {
        return new Column(name, type, description);
    }
}
