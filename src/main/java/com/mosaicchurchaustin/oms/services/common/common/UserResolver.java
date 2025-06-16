package com.mosaicchurchaustin.oms.services.common.common;

import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserSource;
import com.mosaicchurchaustin.oms.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserResolver {

    private final UserRepository userRepository;

    @Transactional
    public UserEntity resolveOrCreate(final JwtAuthenticationToken authenticationToken) {
        return userRepository.findByExternalId(authenticationToken.getName())
                .orElseGet(() -> createUserFromAuth(authenticationToken));
    }

    @Transactional
    public UserEntity resolveOrCreate() {
            return resolveOrCreate((JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication());
     }


    private UserEntity createUserFromAuth(final JwtAuthenticationToken jwtAuthenticationToken) {
        return userRepository.save(UserEntity.builder()
                .externalId(jwtAuthenticationToken.getName())
                .source(getSource(jwtAuthenticationToken))
                .build());
    }

    private UserSource getSource(final JwtAuthenticationToken jwtAuthenticationToken) {
        final String prefix = StringUtils.split(jwtAuthenticationToken.getName(), "|")[0];
        return prefix.equals("auth0") ? UserSource.AUTH0 : UserSource.GOOGLE;
    }
}

