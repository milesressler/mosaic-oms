create table audit_log
(
    id           bigint auto_increment
        primary key,
    created      datetime(6)  null,
    updated      datetime(6)  null,
    user_id         varchar(255) null,
    action         varchar(255) null,
    entity_type         varchar(255) null,
    entity_id       bigint null,
    entity_uuid         varchar(255) null,
    previous_state json null,
    new_state json null,
    additional_info         tinytext null
);
