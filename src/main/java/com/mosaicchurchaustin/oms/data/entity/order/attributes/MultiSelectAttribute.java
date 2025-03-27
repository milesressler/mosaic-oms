package com.mosaicchurchaustin.oms.data.entity.order.attributes;

import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeName("multi")
public class MultiSelectAttribute extends AttributeValue {
    private List<String> values;
}
