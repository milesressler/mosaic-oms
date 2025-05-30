package com.mosaicchurchaustin.oms.services;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.client.mgmt.filter.PageFilter;
import com.auth0.client.mgmt.filter.RolesFilter;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.roles.Role;
import com.auth0.json.mgmt.roles.RolesPage;
import com.auth0.json.mgmt.users.User;
import com.auth0.json.mgmt.users.UsersPage;
import com.mosaicchurchaustin.oms.client.Auth0Client;
import com.mosaicchurchaustin.oms.data.request.CreateUserRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateUserRequest;
import com.mosaicchurchaustin.oms.data.response.AdminUserDetailResponse;
import com.mosaicchurchaustin.oms.data.response.AdminUserResponse;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.OrderHistoryRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminUserService {

    @Autowired
    private ManagementAPI managementAPI;

    @Autowired
    private Auth0Client auth0Client;

    @Autowired
    private OrderHistoryRepository orderHistoryRepository;

    public AdminUserResponse addUser(final CreateUserRequest request) throws Auth0Exception {
        // 1. Look up all users by email
        final List<User> existingUsers = auth0Client.getsUsersByEmail(request.email());

        final Optional<User> googleUser = existingUsers.stream()
                .filter(u -> u.getIdentities().stream().anyMatch(id -> "google-oauth2".equals(id.getProvider())))
                .findFirst();

        final Optional<User> existingDbUser = existingUsers.stream()
                .filter(u -> u.getIdentities().stream().anyMatch(id -> "auth0".equals(id.getProvider())))
                .findFirst();

        // 2. If DB user already exists, abort to prevent duplicates
        if (existingDbUser.isPresent()) {
            throw new InvalidRequestException("A username/password account already exists for this email.");
        }

        // 3. Create the new DB user
        final User user = new User("Username-Password-Authentication");
        user.setEmail(request.email());
        user.setName(request.name());
        user.setPassword(RandomStringUtils.randomAlphanumeric(32).toCharArray());

        final var createdUser = managementAPI.users().create(user).execute().getBody();

        // 4. If there's an existing Google user, link the new DB user to it
        if (googleUser.isPresent()) {
            final String googleUserId = googleUser.get().getId(); // e.g. "google-oauth2|abc"
            final String dbUserIdStripped = createdUser.getId().replace("auth0|", "");

            final var result = managementAPI.users()
                    .linkIdentity(googleUserId, dbUserIdStripped, "auth0", null)
                    .execute();

            return AdminUserResponse.from(auth0Client.getUserById(googleUserId));
        }


        // 5. Otherwise, return the newly created DB user
        return AdminUserResponse.from(auth0Client.getUserById(createdUser.getId()));
    }

    public Page<AdminUserResponse> getUsers(final Pageable pageable, final String roleFilter) throws Auth0Exception {
        final UsersPage usersPage = StringUtils.isBlank(roleFilter) ?
                auth0Client.getUserPage(pageable.getPageNumber(), pageable.getPageSize())
                : auth0Client.getUserPageWithRole(roleFilter, pageable.getPageNumber(), pageable.getPageSize());

        final var content = usersPage.getItems()
                .stream()
                .map(AdminUserResponse::from).toList();
        final var total = Optional.ofNullable(usersPage.getTotal())
                .orElse(usersPage.getItems().toArray().length);
        return new PageImpl<>(content, pageable, total);
    }

    public AdminUserDetailResponse getUser(final String userId) throws Auth0Exception {
        final User user = auth0Client.getUserById(userId);
        final RolesPage rolesPage = managementAPI.users()
                .listRoles(userId, new PageFilter().withPage(0, 100)).execute().getBody();

        return AdminUserDetailResponse.from(user, rolesPage, orderHistoryRepository.findByUserEntityExternalIdOrderByTimestampDesc(userId).stream().limit(10).toList());
    }

    public void sendInvite(final String userId) throws Auth0Exception {
        managementAPI.jobs().sendVerificationEmail(userId, null).execute().getBody().getStatus();
    }
    public AdminUserDetailResponse updateUser(final String userId, final UpdateUserRequest updateUserRequest) throws Auth0Exception {
        final User userToUpdate = auth0Client.getUserById(userId);
//        final RolesPage rolesOnUser = getUserRoles(userId);

//        final String authedUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        final RolesPage availableRoles = managementAPI.roles().list(new RolesFilter()).execute().getBody();


        if (!updateUserRequest.addRoles().isEmpty()) {
            final List<String> addRoleIds = updateUserRequest.addRoles().stream().map(requested -> roleIdFromName(availableRoles, requested)).toList();
                managementAPI.users().addRoles(userId, addRoleIds).execute().getBody();
        }

        if (!updateUserRequest.removeRoles().isEmpty()) {
            final List<String> removeRoleIds = updateUserRequest.removeRoles().stream().map(requested -> roleIdFromName(availableRoles, requested)).toList();
            managementAPI.users().removeRoles(userId, removeRoleIds).execute().getBody();
        }
        return AdminUserDetailResponse.from(userToUpdate, getUserRoles(userId), orderHistoryRepository.findByUserEntityExternalIdOrderByTimestampDesc(userId).stream().limit(10).toList());
    }

    private RolesPage getUserRoles(final String userId) throws Auth0Exception {
        return managementAPI.users()
                .listRoles(userId, new PageFilter().withPage(0, 100)).execute().getBody();
    }

    private String roleIdFromName(final RolesPage available, final String roleName) {
        return available.getItems().stream().filter(i -> i.getName().equalsIgnoreCase(roleName)).map(Role::getId).findAny().orElseThrow(() -> new RuntimeException("Role not valid."));
    }

}
