package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserSource;
import com.mosaicchurchaustin.oms.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    String issueUri;

    @Transactional
    public UserEntity syncUser(final String idToken) {

        final JwtDecoder jwtDecoder = JwtDecoders.fromIssuerLocation(issueUri);
        final Jwt idJwt = jwtDecoder.decode(idToken);

        final JwtAuthenticationToken authenticationToken =
                (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();

        if (!Objects.equals(idJwt.getSubject(), authenticationToken.getName())) {
            throw new BadJwtException("id token doesn't match authorization token");
        }

        final UserEntity userEntity = getOrCreateUserEntity(authenticationToken);

        syncDetails(idJwt, userEntity);

        return userRepository.save(userEntity);
    }

    @Transactional
    public UserEntity currentUser(final JwtAuthenticationToken authenticationToken) {
        return getOrCreateUserEntity(authenticationToken);
    }

    @Transactional
    public UserEntity currentUser() {
        return currentUser((JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication());
    }

    private UserEntity getOrCreateUserEntity(final JwtAuthenticationToken authenticationToken) {
        return userRepository.findByExternalId(authenticationToken.getName())
                .orElseGet(() -> createUserFromAuth(authenticationToken));
    }

    private void syncDetails(final Jwt jwt, final UserEntity userEntity) {
        userEntity.setName(
                jwt.getClaimAsString("name")
        );
        userEntity.setUsername(jwt.getClaimAsString("email"));
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
