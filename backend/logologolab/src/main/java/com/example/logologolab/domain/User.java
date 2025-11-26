package com.example.logologolab.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"email", "provider"}))
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "password")
    private String password;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "nickname")
    private String nickname;

    @Lob
    @Column(name = "profile_image_url", columnDefinition = "LONGTEXT")
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private ProviderType provider;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private RoleType role;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email_noti", nullable = false)
    private boolean emailNoti = true;

    @Column(name = "sms_noti", nullable = false)
    private boolean smsNoti = false;

    @Column(name = "newsletter", nullable = false)
    private boolean newsLetter = false;

    // 생성/수정 메서드
    public static User createLocalUser(String email, String password, String nickname) {
        User u = new User();
        u.email = email;
        u.password = password;
        u.nickname = nickname;
        u.provider = ProviderType.LOCAL;
        u.role = RoleType.USER;
        return u;
    }

    public static User createSocialUser(String email, String nickname, String profileImageUrl, ProviderType provider) {
        User u = new User();
        u.email = email;
        u.nickname = nickname;
        u.profileImageUrl = profileImageUrl;
        u.provider = provider;
        u.role = RoleType.USER;
        return u;
    }

    public void updateNickname(String nickname) { this.nickname = nickname; }
    public void updateProfileImageUrl(String url) { this.profileImageUrl = url; }
    public void updatePhone(String phone) { this.phone = phone; }
    public void updateNotifications(Boolean emailNoti, Boolean smsNoti, Boolean newsLetter) {
        if (emailNoti != null) this.emailNoti = emailNoti;
        if (smsNoti != null)   this.smsNoti   = smsNoti;
        if (newsLetter != null) this.newsLetter = newsLetter;
    }
    public void updateRole(RoleType role) { this.role = role; }
}
