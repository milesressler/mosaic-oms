package com.mosaicchurchaustin.oms.data.entity.order.attributes;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;
import lombok.Setter;


@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type", // JSON must include a "type" property
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SizeAttribute.class, name = "size"),
        @JsonSubTypes.Type(value = StringAttribute.class, name = "string"),
        @JsonSubTypes.Type(value = MultiSelectAttribute.class, name = "multi")
})
public abstract class AttributeValue {

    @Getter
    @Setter
    private String type;

    public abstract String toString();
}
