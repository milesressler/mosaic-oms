package com.mosaicchurchaustin.oms.support.converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.apache.commons.lang3.StringUtils;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

@Converter
public class JsonListAttributeConverter implements AttributeConverter<List<String>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
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
    public List<String> convertToEntityAttribute(String dbData) {
        if (StringUtils.isEmpty(dbData)) {
            return new LinkedList<>();
        }
        List<String> attribute;
        try {
            attribute = objectMapper.readValue(dbData, List.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error reading JSON", e);
        }
        return attribute;
    }
}
