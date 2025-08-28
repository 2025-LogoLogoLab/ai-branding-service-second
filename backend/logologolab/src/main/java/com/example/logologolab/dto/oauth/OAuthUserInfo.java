package com.example.logologolab.dto.oauth;

import com.example.logologolab.domain.ProviderType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class OAuthUserInfo {
    private String email;
    private String nickname;
    private String profileImageUrl;
    private ProviderType provider;
}
