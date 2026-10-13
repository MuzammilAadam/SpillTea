package com.spilltea.security;

import com.spilltea.entity.User;
import com.spilltea.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmailOrPseudonym) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(usernameOrEmailOrPseudonym)
                .or(() -> userRepository.findByPseudonym(usernameOrEmailOrPseudonym))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or pseudonym: " + usernameOrEmailOrPseudonym));

        return UserPrincipal.create(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return UserPrincipal.create(user);
    }
}
