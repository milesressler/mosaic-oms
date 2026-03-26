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
                    col("order_id",             "VARCHAR",  "Opaque identifier — join key to v_order_items_detail"),
                    col("created_at",           "DATETIME", "When the order was placed (UTC)"),
                    col("order_status",         "VARCHAR",  "PENDING_ACCEPTANCE (new, unclaimed) | IN_PROGRESS (being filled) | READY (packed) | COMPLETED (delivered) | CANCELLED"),
                    col("customer_name",        "VARCHAR",  "Full name of the person who placed the order"),
                    col("assignee_name",        "VARCHAR",  "Staff member who claimed the order, or 'Unassigned'"),
                    col("special_instructions", "VARCHAR",  "Free-text note from the customer; often NULL")
            )
    ),

    V_ORDER_ITEMS_DETAIL(
            "v_order_items_detail",
            "One row per line item. Use for item-level analysis, fulfillment rates, and item-by-customer queries.",
            List.of(
                    col("order_id",         "VARCHAR",  "Joins to v_order_summary.order_id"),
                    col("order_created_at", "DATETIME", "When the order was placed (UTC)"),
                    col("order_status",     "VARCHAR",  "Same values as v_order_summary.order_status"),
                    col("customer_name",    "VARCHAR",  "Full name of the customer"),
                    col("item_name",        "VARCHAR",  "Exact item name as stored, e.g. \"Men's Jeans\", \"Women's T-Shirt\". Use LIKE '%keyword%' for fuzzy search"),
                    col("item_category",    "VARCHAR",  "Grouping category such as 'Clothing', 'Food', 'Hygiene'; may be NULL"),
                    col("quantity",         "INT",      "Number of this item requested"),
                    col("quantity_fulfilled","INT",     "Number actually packed; may be NULL or less than quantity if order is incomplete"),
                    col("notes",            "VARCHAR",  "Free-text note on this specific line item; often NULL")
            )
    ),

    V_ITEMS(
            "v_items",
            "The item catalog. Use to look up exact item names or browse categories.",
            List.of(
                    col("item_name",    "VARCHAR", "Exact item name used in orders"),
                    col("category",     "VARCHAR", "Item grouping; may be NULL"),
                    col("availability", "VARCHAR", "AVAILABLE (currently offered) | UNAVAILABLE (discontinued or out of stock)")
            )
    ),

    V_SHOWER_ACTIVITY(
            "v_shower_activity",
            "Shower reservation activity. Use for shower usage counts, wait times, and duration analysis.",
            List.of(
                    col("created_at",          "DATETIME", "When the reservation was created (UTC)"),
                    col("customer_name",       "VARCHAR",  "Name of the person who used the shower"),
                    col("started_at",          "DATETIME", "When the shower session began; NULL if not yet started"),
                    col("ended_at",            "DATETIME", "When the shower session ended; NULL if still in progress"),
                    col("reservation_status",  "VARCHAR",  "WAITING (in queue) | IN_PROGRESS (currently showering) | COMPLETED | CANCELLED"),
                    col("shower_number",       "INT",      "Which shower unit (1, 2, etc.)"),
                    col("duration_minutes",    "INT",      "Computed from started_at to ended_at; NULL if not yet completed")
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
