package com.example.logologolab.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserUpdateRequest {

    @Schema(description = "닉네임")
    private String nickname;

    @Schema(description = "프로필 이미지(Data URI 또는 URL). 예: data:image/svg+xml;base64,PHN2Zy...")
    private String profileImage;   // ← 기존 profileImageUrl 대체

    @Schema(description = "이메일 알림 동의")
    private Boolean emailNoti;

    @Schema(description = "SMS 알림 동의")
    private Boolean smsNoti;

    @Schema(description = "뉴스레터 동의")
    private Boolean newsLetter;

    @Schema(description = "전화번호. 예: 010-1234-1234")
    private String phone;

    @Schema(description = "이메일(식별자). 변경 불가, 보내오면 무시 또는 검증", example = "user@email.com")
    private String email; // 서버에서 변경하지 않도록 가드
}
