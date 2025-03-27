package com.mosaicchurchaustin.oms.services;

import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.users.User;
import com.mosaicchurchaustin.oms.client.Auth0Client;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserSource;
import com.mosaicchurchaustin.oms.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;



    @Autowired
    private Auth0Client auth0Client;

    @Transactional
    public UserEntity syncUser() throws Auth0Exception {

        final String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        final User user = auth0Client.getUserById(userId);

        final JwtAuthenticationToken authenticationToken =
                (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();

        final UserEntity userEntity = getOrCreateUserEntity(authenticationToken);

        syncDetails(user, userEntity);

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

    private void syncDetails(final User user, final UserEntity userEntity) {
        userEntity.setName(
                user.getName()
        );
        userEntity.setAvatar(
                user.getPicture()
        );
        userEntity.setUsername(user.getEmail());
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
