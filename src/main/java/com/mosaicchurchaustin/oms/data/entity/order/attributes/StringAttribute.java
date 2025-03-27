package com.mosaicchurchaustin.oms.data.entity.order.attributes;

import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeName("string")
public class StringAttribute extends AttributeValue {
    private String value;

    public String toString(){
        return value;
    }
}
