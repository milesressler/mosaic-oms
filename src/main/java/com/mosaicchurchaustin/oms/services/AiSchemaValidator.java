package com.mosaicchurchaustin.oms.services;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Validates AiViewSchema column definitions against the live database at startup.
 * Logs warnings if the static schema descriptions have drifted from the actual views.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiSchemaValidator {

    @Qualifier("readOnlyJdbcTemplate")
    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void validate() {
        log.info("Validating AI view schema descriptions against database...");
        boolean allGood = true;

        for (final AiViewSchema view : AiViewSchema.values()) {
            final List<String> actual = jdbcTemplate.queryForList(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? " +
                    "ORDER BY ORDINAL_POSITION",
                    String.class,
                    view.getViewName()
            );

            if (actual.isEmpty()) {
                log.warn("AI schema: view '{}' not found in database — run Flyway migrations.",
                        view.getViewName());
                allGood = false;
                continue;
            }

            final List<String> expected = view.getColumnNames();

            final List<String> missing = expected.stream()
                    .filter(c -> !actual.contains(c))
                    .toList();
            if (!missing.isEmpty()) {
                log.warn("AI schema: view '{}' — columns in AiViewSchema but not in DB (update the view or remove the description): {}",
                        view.getViewName(), missing);
                allGood = false;
            }

            final List<String> undocumented = actual.stream()
                    .filter(c -> !expected.contains(c))
                    .toList();
            if (!undocumented.isEmpty()) {
                log.warn("AI schema: view '{}' — columns in DB but not described in AiViewSchema (add descriptions): {}",
                        view.getViewName(), undocumented);
                allGood = false;
            }
        }

        if (allGood) {
            log.info("AI view schema validation passed — all {} views match.", AiViewSchema.values().length);
        }
    }
}
