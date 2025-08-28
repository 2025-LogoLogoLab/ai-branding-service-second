package com.example.logologolab.service.s3;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3UploadService {

    private final AmazonS3 s3;

    @Value("${s3.bucket}")
    private String bucketName;

    /**
     * data URL("data:image/png;base64,...") 또는 순수 base64("iVBOR...")를 받아 S3에 업로드하고 공개 URL 반환
     */
    public String uploadBase64AndGetUrl(String base64OrDataUrl) {
        ParseResult p = parseDataUrl(base64OrDataUrl);
        byte[] bytes = Base64.getDecoder().decode(p.payload().getBytes(StandardCharsets.UTF_8));

        String key = buildKey(p.ext()); // 예: logos/2025/08/12/uuid.png

        ObjectMetadata meta = new ObjectMetadata();
        meta.setContentType(p.mime());
        meta.setContentLength(bytes.length);

        s3.putObject(bucketName, key, new ByteArrayInputStream(bytes), meta);

        // 버킷 정책으로 logos/* 공개 허용이면 이 URL이 바로 접근 가능
        return s3.getUrl(bucketName, key).toString();
    }

    /**
     * 바이트 배열 + MIME 타입으로 업로드하고 공개 URL 반환 (이미 mime/확장자를 알고 있을 때)
     */
    public String uploadBytesAndGetUrl(byte[] bytes, String mime, String ext) {
        String key = buildKey(ext);

        ObjectMetadata meta = new ObjectMetadata();
        meta.setContentType(mime);
        meta.setContentLength(bytes.length);

        s3.putObject(bucketName, key, new ByteArrayInputStream(bytes), meta);
        return s3.getUrl(bucketName, key).toString();
    }

    /* ================= helpers ================= */

    private String buildKey(String ext) {
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return String.format("logos/%s/%s.%s", datePath, UUID.randomUUID(), ext);
    }

    private ParseResult parseDataUrl(String input) {
        String mime = "image/png";
        String ext = "png";
        String payload = input;

        if (input.startsWith("data:")) {
            int comma = input.indexOf(',');
            if (comma > 0) {
                String header = input.substring(5, comma); // e.g. image/png;base64
                payload = input.substring(comma + 1);
                String[] parts = header.split(";");
                if (parts.length > 0) mime = parts[0];
            }
        }

        if ("image/svg+xml".equalsIgnoreCase(mime)) ext = "svg";
        else if ("image/webp".equalsIgnoreCase(mime)) ext = "webp";
        else if ("image/jpeg".equalsIgnoreCase(mime) || "image/jpg".equalsIgnoreCase(mime)) ext = "jpg";
        else if ("image/png".equalsIgnoreCase(mime)) ext = "png";
        else { mime = "image/png"; ext = "png"; }

        return new ParseResult(mime, ext, payload);
    }

    private record ParseResult(String mime, String ext, String payload) {}
}
