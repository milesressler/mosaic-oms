create table customers
(
    id           bigint auto_increment
        primary key,
    created      datetime(6)  null,
    updated      datetime(6)  null,
    name         varchar(255) null,
    phone_number varchar(255) null,
    uuid         varchar(255) null
);

create table items
(
    id                bigint auto_increment
        primary key,
    created           datetime(6)  null,
    updated           datetime(6)  null,
    description       varchar(255) not null,
    is_suggested_item bit          not null
);

create table orders
(
    id                   bigint auto_increment
        primary key,
    created              datetime(6)                                                                    null,
    updated              datetime(6)                                                                    null,
    opt_in_notifications bit                                                                            not null,
    order_status         enum ('AWAITING_DELIVERY', 'COMPLETED', 'CREATED', 'DELIVERING', 'FULFILLING') not null,
    special_instructions varchar(255)                                                                   null,
    customer_id          bigint                                                                         null,
    uuid                 varchar(255)                                                                   null,
    constraint FKpxtb8awmi0dk6smoh2vp1litg
        foreign key (customer_id) references customers (id)
);

create table order_items
(
    id                 bigint auto_increment
        primary key,
    created            datetime(6)  null,
    updated            datetime(6)  null,
    notes              varchar(255) null,
    quantity           int          not null,
    quantity_fulfilled int          null,
    item_entity_id     bigint       not null,
    order_entity_id    bigint       not null,
    constraint FK7b8e2c4mbsdha9wk2kn24gee
        foreign key (order_entity_id) references orders (id),
    constraint FKj0bu1obirdhj1jtg94nqgrni
        foreign key (item_entity_id) references items (id)
);

create table users
(
    id       bigint auto_increment
        primary key,
    created  datetime(6)  null,
    updated  datetime(6)  null,
    name     varchar(255) null,
    source   int          null,
    username varchar(255) null,
    uuid     varchar(255) null
);

create table order_history
(
    id              bigint auto_increment
        primary key,
    type            enum ('STATUS_CHANGE')                                                         not null,
    order_status    enum ('AWAITING_DELIVERY', 'COMPLETED', 'CREATED', 'DELIVERING', 'FULFILLING') null,
    timestamp       datetime(6)                                                                    not null,
    order_entity_id bigint                                                                         not null,
    user_entity_id  bigint                                                                         not null,
    constraint FK6129nx9e7tm2p9mcsi9uu0k5e
        foreign key (user_entity_id) references users (id),
    constraint FKhcbbneoi2sscferrj29b8luyb
        foreign key (order_entity_id) references orders (id)
);

