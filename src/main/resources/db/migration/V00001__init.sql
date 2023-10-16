create table customers
(
    id           bigint auto_increment
        primary key,
    created      datetime(6)  null,
    updated      datetime(6)  null,
    name         varchar(255) null,
    phone_number varchar(255) null
);



create table items
(
    id                bigint auto_increment
        primary key,
    created           datetime(6)  null,
    updated           datetime(6)  null,
    description       varchar(255) null,
    is_suggested_item bit          null
);

create table orders
(
    id                   bigint auto_increment
        primary key,
    created              datetime(6)                                                                    null,
    updated              datetime(6)                                                                    null,
    opt_in_notifications bit                                                                            null,
    order_status         enum ('AWAITING_DELIVERY', 'COMPLETED', 'CREATED', 'DELIVERING', 'FULFILLING') null,
    special_instructions varchar(255)                                                                   null,
    customer_id          bigint                                                                         null,
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
    quantity           int          null,
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
    username varchar(255) null
);

create table order_history
(
    id              bigint auto_increment
        primary key,
    type            enum ('STATUS_CHANGE')                                                         null,
    order_status    enum ('AWAITING_DELIVERY', 'COMPLETED', 'CREATED', 'DELIVERING', 'FULFILLING') null,
    timestamp       datetime(6)                                                                    null,
    order_entity_id bigint                                                                         null,
    user_entity_id  bigint                                                                         null,
    constraint FK6129nx9e7tm2p9mcsi9uu0k5e
        foreign key (user_entity_id) references users (id),
    constraint FKhcbbneoi2sscferrj29b8luyb
        foreign key (order_entity_id) references orders (id)
);

create table orders_order_history_entity_list
(
    order_entity_id              bigint not null,
    order_history_entity_list_id bigint not null,
    constraint UK_aid85ol9hw84ny4oupidm81j4
        unique (order_history_entity_list_id),
    constraint FKj5bd35qdyrh2upwt2p7af4l82
        foreign key (order_entity_id) references orders (id),
    constraint FKpvk0s6xt09gtat7qluf1vu20e
        foreign key (order_history_entity_list_id) references order_history (id)
);

