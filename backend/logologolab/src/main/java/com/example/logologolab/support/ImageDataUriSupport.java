package com.example.logologolab.support;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Base64;

public final class ImageDataUriSupport {

    private ImageDataUriSupport() {}

    public static String toDataUriFromUrl(String url) {
        if (url == null || url.isBlank()) return null;

        try {
            URLConnection conn = new URL(url).openConnection();
            conn.setConnectTimeout(2000);
            conn.setReadTimeout(3000);

            try (InputStream in = conn.getInputStream()) {
                byte[] bytes = in.readAllBytes();
                String mime = guessMime(url, bytes);
                String base64 = Base64.getEncoder().encodeToString(bytes);
                return "data:" + mime + ";base64," + base64;
            }
        } catch (Exception e) {
            // 실패 시 null 반환(프론트에서 기본 아바타 처리 권장)
            return null;
        }
    }

    private static String guessMime(String url, byte[] bytes) {
        String lower = url.toLowerCase();
        if (lower.endsWith(".svg"))  return "image/svg+xml";
        if (lower.endsWith(".png"))  return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";

        try {
            String detected = URLConnection.guessContentTypeFromStream(new ByteArrayInputStream(bytes));
            return detected != null ? detected : "application/octet-stream";
        } catch (Exception ignore) {
            return "application/octet-stream";
        }
    }
}
