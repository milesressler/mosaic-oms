package com.mosaicchurchaustin.oms.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@Slf4j
@Configuration
public class ReadOnlyDataSourceConfig {

    @Bean(name = "readOnlyJdbcTemplate")
    public JdbcTemplate readOnlyJdbcTemplate(
            @Value("${mosaic.oms.readonly-datasource.url:}") final String url,
            @Value("${mosaic.oms.readonly-datasource.username:}") final String username,
            @Value("${mosaic.oms.readonly-datasource.password:}") final String password,
            final DataSource primaryDataSource) {

        if (url.isBlank() || username.isBlank()) {
            log.warn("No read-only datasource configured (DB_READONLY_URL / DB_READONLY_USERNAME not set). " +
                     "AI queries will use the primary datasource — set up a read-only DB user for production.");
            return new JdbcTemplate(primaryDataSource);
        }

        final DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        ds.setUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);

        log.info("Read-only datasource configured for AI queries.");
        return new JdbcTemplate(ds);
    }
}
