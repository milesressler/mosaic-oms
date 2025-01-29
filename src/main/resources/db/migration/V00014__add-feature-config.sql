create table features
(
    id                bigint auto_increment
        primary key,
    created           datetime(6)  null,
    updated           datetime(6)  null,
    groupme_enabled bit          not null
);

insert into features   (id, created, groupme_enabled) values (1, current_timestamp(), false);


