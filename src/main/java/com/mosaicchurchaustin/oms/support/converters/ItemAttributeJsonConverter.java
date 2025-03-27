package com.mosaicchurchaustin.oms.support.converters;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mosaicchurchaustin.oms.data.entity.order.attributes.AttributeValue;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.HashMap;
import java.util.Map;

@Converter
public class ItemAttributeJsonConverter implements AttributeConverter<Map<String, AttributeValue>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, AttributeValue> attributeValues) {
        if (attributeValues == null || attributeValues.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attributeValues);
        } catch (Exception e) {
            throw new RuntimeException("Error converting attribute values to JSON", e);
        }
    }

    @Override
    public Map<String, AttributeValue> convertToEntityAttribute(String json) {
        if (json == null || json.isEmpty()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, AttributeValue>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Error converting JSON to attribute values", e);
        }
    }
}

