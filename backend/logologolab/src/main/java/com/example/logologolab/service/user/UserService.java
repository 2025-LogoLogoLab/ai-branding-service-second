package com.example.logologolab.service.user;

import com.example.logologolab.domain.User;
import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.dto.user.UserUpdateRequest;
import com.example.logologolab.dto.oauth.OAuthUserInfo;
import com.example.logologolab.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerLocalUser(String email, String plainPassword, String nickname) {
        // 중복 이메일 체크 (LOCAL 사용자만 해당)
        Optional<User> existing = userRepository.findByEmailAndProvider(email, ProviderType.LOCAL);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        String hashedPassword = passwordEncoder.encode(plainPassword);
        User user = User.createLocalUser(email, hashedPassword, nickname);
        return userRepository.save(user);
    }

    @Transactional
    public User registerOrLogin(OAuthUserInfo userInfo) {
        return userRepository.findByEmailAndProvider(userInfo.getEmail(), userInfo.getProvider())
                .orElseGet(() -> {
                    User newUser = User.createSocialUser(
                            userInfo.getEmail(),
                            userInfo.getNickname(),
                            userInfo.getProfileImageUrl(),
                            userInfo.getProvider()
                    );
                    return userRepository.save(newUser);
                });
    }

    public User findByEmailAndProvider(String email, ProviderType provider) {
        return userRepository.findByEmailAndProvider(email, provider)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다."));
    }

    @Transactional
    public User updateUser(String email, ProviderType provider, UserUpdateRequest req) {
        User user = userRepository.findByEmailAndProvider(email, provider)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보 없음"));

        // 닉네임
        if (req.getNickname() != null && !req.getNickname().isBlank()) {
            user.updateNickname(req.getNickname().trim());
        }

        // 프로필 이미지
        if (req.getProfileImage() != null && !req.getProfileImage().isBlank()) {
            String img = req.getProfileImage().trim();
            // data: 로 시작하면 DB에 그대로 저장
            // URL이면 그대로 저장(조회 시 Data URI 변환)
            user.updateProfileImageUrl(img);
        }

        // 연락처
        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            user.updatePhone(req.getPhone().trim());
        }

        // 알림 동의(부분 업데이트 허용)
        user.updateNotifications(req.getEmailNoti(), req.getSmsNoti(), req.getNewsLetter());

        return user; // JPA dirty checking
    }

    @Transactional
    public void deleteUserByEmailAndProvider(String email, ProviderType provider) {
        User user = userRepository.findByEmailAndProvider(email, provider)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
        userRepository.delete(user);
    }
}