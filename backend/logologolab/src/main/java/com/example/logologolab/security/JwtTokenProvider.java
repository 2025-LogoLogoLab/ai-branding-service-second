package com.example.logologolab.security;

import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.domain.RoleType;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret-key}")
    private String SECRET_KEY;

    @Value("${jwt.expiration}") // access token 만료시간 (ms)
    private long ACCESS_TOKEN_EXPIRATION;

    @Value("${jwt.refresh-expiration}") // refresh token 만료시간 (ms)
    private long REFRESH_TOKEN_EXPIRATION;

    // Access Token 생성 (role 포함)
    public String createAccessToken(String email, ProviderType provider, RoleType role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("provider", provider.name())
                .claim("role", role.name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    // Refresh Token 생성 (role 없음)
    public String createRefreshToken(String email, ProviderType provider) {
        return Jwts.builder()
                .setSubject(email)
                .claim("provider", provider.name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);
            return true;
        } catch (SignatureException | ExpiredJwtException | MalformedJwtException e) {
            return false;
        }
    }

    public String getEmail(String token) { return getClaims(token).getSubject(); }
    public String getProvider(String token) { return (String) getClaims(token).get("provider"); }
    public String getRole(String token) { return (String) getClaims(token).get("role"); } // ★ 추가
    public Date getExpirationDate(String token) { return getClaims(token).getExpiration(); }
    public long getAccessTokenExpiration() { return ACCESS_TOKEN_EXPIRATION; }
}
