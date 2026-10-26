package com.mosaicchurchaustin.oms.support.converters;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mosaicchurchaustin.oms.data.entity.order.ItemLimitStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.apache.commons.lang3.StringUtils;

@Converter
public class ItemLimitStatusJsonConverter implements AttributeConverter<ItemLimitStatus, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            // Snapshots are kept forever, so tolerate fields that are later removed
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

    @Override
    public String convertToDatabaseColumn(final ItemLimitStatus status) {
        if (status == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(status);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error converting item limit status to JSON", e);
        }
    }

    @Override
    public ItemLimitStatus convertToEntityAttribute(final String json) {
        if (StringUtils.isEmpty(json)) {
            return null;
        }
        try {
            return objectMapper.readValue(json, ItemLimitStatus.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error reading item limit status JSON", e);
        }
    }
}
