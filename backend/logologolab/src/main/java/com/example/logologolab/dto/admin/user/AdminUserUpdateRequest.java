package com.example.logologolab.dto.admin.user;

import com.example.logologolab.domain.RoleType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserUpdateRequest {

    @Schema(description = "프로필 이미지 URL", example = "http://k.kakaocdn.net/dn/OGqwt/btsPYJ0MqKa/...")
    private String profileImage;

    @Schema(description = "닉네임", example = "관리자가 수정한 닉네임")
    private String nickname;

    @Schema(description = "이메일 알림 동의", example = "true")
    private Boolean emailNoti;

    @Schema(description = "SMS 알림 동의", example = "false")
    private Boolean smsNoti;

    @Schema(description = "뉴스레터 동의", example = "false")
    private Boolean newsLetter;

    @Schema(description = "전화번호", example = "010-1234-5678")
    private String phone;

    @Schema(description = "사용자 권한", example = "ADMIN")
    private RoleType role;

}