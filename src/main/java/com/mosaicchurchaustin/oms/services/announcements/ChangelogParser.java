package com.mosaicchurchaustin.oms.services.announcements;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ChangelogParser {

    private static final Pattern ENTRY_PATTERN = Pattern.compile(
            "## \\[(\\d{4}-\\d{2}-\\d{2})\\]\\s*(.*?)\\s*(?=## \\[|\\z)",
            Pattern.DOTALL
    );


    public static List<ChangelogEntry> parseChangelog(final String changeLog) {
        Matcher matcher = ENTRY_PATTERN.matcher(changeLog);

        List<ChangelogEntry> entries = new ArrayList<>();

        while (matcher.find()) {
            String dateStr = matcher.group(1);
            String body = matcher.group(2).trim();

            LocalDate date = LocalDate.parse(dateStr);
            entries.add(new ChangelogEntry(date, body));
        }

        return entries;
    }

    public record ChangelogEntry(LocalDate date, String body) {}
}
