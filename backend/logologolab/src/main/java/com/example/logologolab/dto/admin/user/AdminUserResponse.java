package com.example.logologolab.dto.admin.user;

import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.domain.RoleType;
import com.example.logologolab.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder // 생성자의 파라미터가 많아지므로 Builder 패턴을 사용하는 것이 더 명확합니다.
public class AdminUserResponse {

    private Long id;
    private ProviderType provider;
    private RoleType role;
    private String profileImage;
    private String nickname;
    private String email;
    private String phone;
    private boolean emailNoti;
    private boolean smsNoti;
    private boolean newsLetter;

    /**
     * User 엔티티를 AdminUserResponse DTO로 변환하는 정적 팩토리 메서드
     */
    public static AdminUserResponse from(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .provider(user.getProvider())
                .role(user.getRole())
                .profileImage(user.getProfileImageUrl()) // User 엔티티의 필드명은 profileImageUrl 입니다.
                .nickname(user.getNickname())
                .email(user.getEmail())
                .phone(user.getPhone())
                .emailNoti(user.isEmailNoti())
                .smsNoti(user.isSmsNoti())
                .newsLetter(user.isNewsLetter())
                .build();
    }
}