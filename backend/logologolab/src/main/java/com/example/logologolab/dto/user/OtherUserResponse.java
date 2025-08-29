package com.example.logologolab.dto.user;

import com.example.logologolab.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OtherUserResponse {
    private Long id;
    private String nickname;
    private String profileImageUrl;

    public static com.example.logologolab.dto.user.OtherUserResponse from(User user) {
        return new com.example.logologolab.dto.user.OtherUserResponse(
                user.getId(),
                user.getNickname(),
                user.getProfileImageUrl()
        );
    }
}
