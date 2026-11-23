package com.mosaicchurchaustin.oms.data.entity.event;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * A special event, e.g. a Christmas giveaway: a named set of regular catalog items that order takers pick from
 * on a dedicated page. Orders taken for an event skip filling and running and go straight to pickup.
 */
@Entity
@Table(name = "special_events")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class SpecialEventEntity extends BaseUuidEntity {
    public static final String ENTITY_NAME = "SpecialEvent";

    @Override
    public String getEntityType() {
        return ENTITY_NAME;
    }

    @Column(name = "name", nullable = false)
    String name;

    /**
     * Informational only; whether order takers see the event is controlled by the active event setting
     */
    @Column(name = "event_date")
    LocalDate eventDate;

    /**
     * How many different items a guest may pick for this event
     */
    @Column(name = "items_per_guest", nullable = false)
    Integer itemsPerGuest;

    @Builder.Default
    @OneToMany(mappedBy = "specialEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC NULLS LAST, id ASC")
    @ToString.Exclude
    List<SpecialEventItemEntity> items = new ArrayList<>();
}
