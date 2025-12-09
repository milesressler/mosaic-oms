package com.mosaicchurchaustin.oms.data.response;

import com.auth0.json.mgmt.users.User;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PaginatedUsersResponse {
    private final List<User> users;
    private final Integer total;
    private final Integer start;
    private final Integer length;
    private final Integer limit;
    
    public static PaginatedUsersResponse from(List<User> users, Integer total, Integer start, Integer length, Integer limit) {
        return PaginatedUsersResponse.builder()
                .users(users)
                .total(total)
                .start(start)
                .length(length)
                .limit(limit)
                .build();
    }
}