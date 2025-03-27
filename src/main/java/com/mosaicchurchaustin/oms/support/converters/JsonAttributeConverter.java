package com.mosaicchurchaustin.oms.support.converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.apache.commons.lang3.StringUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Converter
public class JsonAttributeConverter implements AttributeConverter<Map<String, String>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, String> attribute) {
        if (Objects.isNull(attribute) || attribute.isEmpty()) {
            return null;
        }
        String dbData = null;
        try {
            dbData = objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting to JSON", e);
        }
        return dbData;
    }

    @Override
    public Map<String, String> convertToEntityAttribute(String dbData) {
        if (StringUtils.isEmpty(dbData)) {
            return new HashMap<>();
        }
        Map<String, String> attribute;
        try {
            attribute = objectMapper.readValue(dbData, Map.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error reading JSON", e);
        }
        return attribute;
    }
}
