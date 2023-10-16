package com.mosaicchurchaustin.oms.data.converter;

import com.mosaicchurchaustin.oms.data.entity.user.UserSource;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserSourceConverter implements AttributeConverter<UserSource, Integer> {

    @Override
    public Integer convertToDatabaseColumn(final UserSource attribute) {
        return attribute == null ? null : attribute.getId();
    }

    @Override
    public UserSource convertToEntityAttribute(final Integer dbData) {
        return UserSource.from(dbData).orElse(null);
    }
}
