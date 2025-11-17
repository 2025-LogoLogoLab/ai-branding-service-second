package com.example.logologolab.service.auth;

import com.example.logologolab.domain.ProviderType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String PREFIX = "refresh:";

    //    일관된 키 생성을 위해 private 헬퍼 메서드 사용
    private String createKey(String email, ProviderType provider) {
        return "refresh:" + provider.name() + ":" + email;
    }

    // Redis에 저장
    public void saveRefreshToken(String email, ProviderType provider, String token, long durationMillis) {
        String key = createKey(email, provider);
        redisTemplate.opsForValue().set(key, token, durationMillis, TimeUnit.MILLISECONDS);
    }

    // Redis에서 가져오기
    public String getRefreshToken(String email, ProviderType provider) {
        String key = createKey(email, provider);
        return redisTemplate.opsForValue().get(key);
    }

    // Redis에서 삭제
    public void deleteRefreshToken(String email, ProviderType provider) {
        String key = createKey(email, provider);
        redisTemplate.delete(key);
    }
}
