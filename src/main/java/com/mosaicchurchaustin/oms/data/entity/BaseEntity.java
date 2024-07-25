package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.ToString;
import org.hibernate.Hibernate;

import java.util.Calendar;
import java.util.Objects;

@MappedSuperclass
@ToString
@Getter
public abstract class BaseEntity {

    public abstract String getEntityType();

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
