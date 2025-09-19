package com.example.logologolab.service.admin;

import com.example.logologolab.domain.RoleType;
import com.example.logologolab.domain.User;
import com.example.logologolab.dto.admin.user.AdminUserResponse;
import com.example.logologolab.dto.admin.user.AdminUserUpdateRequest;
import com.example.logologolab.repository.logo.LogoRepository;
import com.example.logologolab.repository.user.UserRepository;
import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.dto.admin.user.AdminUserCreateRequest;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.MethodArgumentNotValidException;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final LogoRepository logoRepository;

    /** [어드민] 신규 사용자 생성 */
    public AdminUserResponse createUser(AdminUserCreateRequest request) {
        // 1. 중복 체크 (모든 Provider 대상)
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다: " + request.getEmail());
        }

        // 2. 비밀번호 암호화
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User newUser = User.createLocalUser(
                request.getEmail(),
                hashedPassword,
                request.getNickname()
        );
        // 3. 역할(Role)을 요청에 따라 지정
        newUser.updateRole(request.getRole());

        User savedUser = userRepository.save(newUser);
        return AdminUserResponse.from(savedUser);
    }

    /** [어드민] 모든 사용자 목록 조회 (페이징) */
    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(AdminUserResponse::from);
    }

    /** [어드민] 특정 사용자 상세 조회 */
    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("ID에 해당하는 사용자가 없습니다: " + userId));
        return AdminUserResponse.from(user);
    }

    /** [어드민] 특정 사용자 정보 수정 */
    public AdminUserResponse updateUser(Long userId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("ID에 해당하는 사용자가 없습니다: " + userId));

        // 닉네임 변경
        if (request.getNickname() != null && !request.getNickname().isBlank()) {
            user.updateNickname(request.getNickname());
        }

        // 프로필 이미지 변경
        if (request.getProfileImage() != null) {
            user.updateProfileImageUrl(request.getProfileImage());
        }

        // 전화번호 변경
        if (request.getPhone() != null) {
            user.updatePhone(request.getPhone());
        }

        // 역할(Role) 변경
        if (request.getRole() != null) {
            user.updateRole(request.getRole());
        }

        // 알림 설정 변경
        user.updateNotifications(
                request.getEmailNoti(),
                request.getSmsNoti(),
                request.getNewsLetter()
        );

        return AdminUserResponse.from(user);
    }

    /** [어드민] 사용자 ID로 사용자 삭제 */
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("ID에 해당하는 사용자가 없습니다: " + userId);
        }
        // 사용자와 연관된 데이터(산출물, 프로젝트 등) 처리 정책 결정 필요
        userRepository.deleteById(userId);
    }
}