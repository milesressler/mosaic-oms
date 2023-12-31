package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;
import org.hibernate.Hibernate;

import java.util.Calendar;
import java.util.Objects;

@MappedSuperclass
@ToString
@Getter
public abstract class BaseEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "created", updatable = false)
    Calendar created;

    @Column(name = "updated")
    Calendar updated;

    @PrePersist
    protected void onCreate() {
        this.created = Calendar.getInstance();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updated = Calendar.getInstance();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        BaseEntity that = (BaseEntity) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
