package com.mosaicchurchaustin.oms.services.security;

import com.mosaicchurchaustin.oms.data.constants.MosaicAuthority;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public class CustomJwtGrantedAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    private static final String ROLE_CLAIM = "https://mosaic.miles-smiles.us/roles";
    private final JwtGrantedAuthoritiesConverter defaultGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public Collection<GrantedAuthority> convert(final Jwt jwt) {
        final Collection<GrantedAuthority> grantedAuthorities = defaultGrantedAuthoritiesConverter.convert(jwt);

        final Collection<GrantedAuthority> permissions = jwt.getClaimAsStringList("permissions").stream()
                .map(MosaicAuthority::fromString)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(permission -> (GrantedAuthority) permission::getAuthority)
                .toList();

        grantedAuthorities.addAll(permissions);

        List<String> roles = jwt.getClaimAsStringList(ROLE_CLAIM);
        if (roles != null) {
            roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    .forEach(grantedAuthorities::add);
        }

        return grantedAuthorities;
    }
}
