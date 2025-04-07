ALTER TABLE devices
    ADD column user_agent varchar(1024),
    add column last_accessed datetime(6)  null;
