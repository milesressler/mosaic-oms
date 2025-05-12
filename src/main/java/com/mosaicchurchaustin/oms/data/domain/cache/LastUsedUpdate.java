package com.mosaicchurchaustin.oms.data.domain.cache;

import java.time.Instant;

public record LastUsedUpdate(String uuid, Instant lastAccessed) { }
