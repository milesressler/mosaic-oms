package com.mosaicchurchaustin.oms.services.audit;

import java.util.Map;

public interface Auditable {

    void stashState();
    Map<String, String> getCurrentState();
    Map<String, String> getPreviousState();


}
