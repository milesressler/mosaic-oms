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
@JsonTypeName("size") // This tells Jackson to use this class when "type": "string"
public class SizeAttribute extends AttributeValue {
    private int waist;
    private int length;
}
