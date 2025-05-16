package com.mosaicchurchaustin.oms.config;

import com.mosaicchurchaustin.oms.services.announcements.ChangelogParser;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
public class ResourcesConfig {

    @Bean
    public String changeLog() throws IOException {
        final InputStream inputStream = getClass().getResourceAsStream("/changelog.md");
        if (inputStream == null) {
            throw new FileNotFoundException("Changelog.md not found");
        }
        return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
    }

    @Bean
    public List<ChangelogParser.ChangelogEntry> changelogEntries() throws IOException {
        return ChangelogParser.parseChangelog(changeLog());
    }



}
