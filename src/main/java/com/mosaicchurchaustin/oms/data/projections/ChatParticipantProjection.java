package com.mosaicchurchaustin.oms.data.projections;

import java.time.Instant;

public interface ChatParticipantProjection {
    String getUuid();
    String getExternalId();
    String getName();
    String getAvatar();
    String getLastMessageContent();
    Instant getLastMessageTime();
    Boolean getLastMessageFromMe();
}