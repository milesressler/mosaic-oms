package com.mosaicchurchaustin.oms.util.strings;

import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.StringUtils;

@UtilityClass
public class SlugUtils {
    public String generateSlug(String input) {
        if (StringUtils.isBlank(input)) {
            return "";
        }
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "") // Remove special chars except spaces/hyphens
                .replaceAll("\\s+", "-")       // Replace spaces with hyphens
                .replaceAll("-{2,}", "-")      // Remove multiple hyphens
                .replaceAll("^-|-$", "");      // Trim hyphens from start/end
    }
}
