create table devices
(
    id           bigint auto_increment
        primary key,
    created      datetime(6)  null,
    updated      datetime(6)  null,
    expiration      datetime(6)  null,
    uuid         varchar(255) null,
    name         varchar(255) null,
    hashed_token         varchar(255) null
);
