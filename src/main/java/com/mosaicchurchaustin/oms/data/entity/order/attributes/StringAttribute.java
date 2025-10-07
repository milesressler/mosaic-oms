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
    private String value;         // Normalized value for backend processing
    private String displayValue;  // User-friendly display value
    
    // Constructor for backward compatibility with single value
    public StringAttribute(String value) {
        this.value = value;
        this.displayValue = value;  // Default to same value
    }

    public String toString(){
        return displayValue != null ? displayValue : value;
    }
}
