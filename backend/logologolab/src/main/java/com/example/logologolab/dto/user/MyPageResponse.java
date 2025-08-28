package com.example.logologolab.dto.user;

import com.example.logologolab.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyPageResponse {
    private String profileImage;  // data:[mime];base64,xxxx  (권장: "data:" 접두 포함)
    private String nickname;
    private boolean emailNoti;
    private boolean smsNoti;
    private boolean newsLetter;
    private String email;
    private String phone;

    public static MyPageResponse from(User user, String profileImageDataUri) {
        return new MyPageResponse(
                profileImageDataUri,
                user.getNickname(),
                user.isEmailNoti(),
                user.isSmsNoti(),
                user.isNewsLetter(),
                user.getEmail(),
                user.getPhone()
        );
    }
}

