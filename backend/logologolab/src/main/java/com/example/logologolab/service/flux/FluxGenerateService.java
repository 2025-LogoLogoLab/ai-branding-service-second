package com.example.logologolab.service.flux;

import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FluxGenerateService {

    private static final String AI_SERVER_URL = "http://195.26.233.76:39535/generate-logo";

    private static final Set<String> ALLOWED_STYLES = Set.of(
            "simple","minimal","retro","vintage","cute","playful","luxury",
            "tattoo","futuristic","cartoon","watercolor","none"
    );

    /* ===================== Public APIs ===================== */

    // 기본 1장 (호환용)
    public List<String> generateLogoImageBase64(String prompt) {
        return generateLogoImageBase64(prompt, "minimal", "", 50, 3.5, 1024, 1024, 1);
    }

    // 여러 장 지원
    public List<String> generateLogoImageBase64(
            String prompt,
            String style,
            String negative_prompt,
            Integer steps,
            Double guidanceScale,
            Integer width,
            Integer height,
            Integer num_images
    ) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(600000);
        factory.setReadTimeout(600000);

        RestTemplate restTemplate = new RestTemplate(factory);

        HttpHeaders headers = jsonHeaders();

        Map<String, Object> body = buildRequestBody(
                prompt, style,
                negative_prompt,
                steps, guidanceScale, width, height, num_images
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(AI_SERVER_URL, request, Map.class);
            Map<?, ?> resp = response.getBody();
            if (resp == null) throw new IllegalStateException("빈 응답");

            // 1) { "base64": "..." } 단일로만 온 경우 → 1개 리스트
            Object base64 = resp.get("base64");
            if (base64 instanceof String s && !s.isBlank()) {
                return List.of(normalizeDataUrl(s));
            }

            // 2) { "images": ["...","..."] } (base64 목록)
            Object images = resp.get("images");
            if (images instanceof List<?> list && !list.isEmpty()) {
                // 문자열 배열 or 객체배열(base64 필드) 모두 지원
                List<String> out = new ArrayList<>();
                for (Object o : list) {
                    if (o instanceof String str && !str.isBlank()) {
                        out.add(normalizeDataUrl(str));
                    } else if (o instanceof Map<?,?> m) {
                        Object b = m.get("base64");
                        if (b instanceof String str2 && !str2.isBlank()) {
                            out.add(normalizeDataUrl(str2));
                        }
                    }
                }
                if (!out.isEmpty()) return out;
            }

            // 3) { "image_urls": ["...","..."] } (URL 목록)
            Object urls = resp.get("image_urls");
            if (urls instanceof List<?> list2 && !list2.isEmpty()) {
                return list2.stream()
                        .filter(String.class::isInstance)
                        .map(String.class::cast)
                        .filter(s -> !s.isBlank())
                        .map(this::absolutizeUrl)
                        .collect(Collectors.toList());
            }

            throw new IllegalStateException("응답에 base64 / images / image_urls가 없습니다.");
        } catch (HttpClientErrorException e) {
            // FastAPI 4xx 오류 메시지 그대로 노출 (디버깅 편의)
            throw new IllegalStateException("AI 서버 4xx: " + e.getResponseBodyAsString(), e);
        }
    }

    /* ===================== Helpers ===================== */

    private HttpHeaders jsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private Map<String, Object> buildRequestBody(
            String prompt,
            String style,
            String negative_prompt,
            Integer steps,
            Double guidanceScale,
            Integer width,
            Integer height,
            Integer num_images
    ) {
        String normStyle = (style == null ? "minimal" : style.trim().toLowerCase());
        if (!ALLOWED_STYLES.contains(normStyle)) normStyle = "minimal";

        Map<String, Object> body = new HashMap<>();
        body.put("prompt", Objects.requireNonNullElse(prompt, "").trim());
        body.put("style", normStyle);

        // 기본값 보정
        //body.put("steps", steps != null ? steps : 50);
        body.put("steps", steps = 50);
        body.put("guidance_scale", guidanceScale != null ? guidanceScale : 3.5);
        body.put("width", width != null ? width : 1024);
        body.put("height", height != null ? height : 1024);
        body.put("num_images", num_images != null ? num_images : 1);

        /*if (negative_prompt != null && !negative_prompt.isBlank()) {
            body.put("negative_prompt", negative_prompt);
        }*/
        return body;
    }

    private String normalizeDataUrl(String s) {
        return s.startsWith("data:") ? s : ("data:image/png;base64," + s);
    }

    private String absolutizeUrl(String maybeRelative) {
        if (maybeRelative.startsWith("http://") || maybeRelative.startsWith("https://")) {
            return maybeRelative;
        }
        // 서버가 상대경로만 줄 때 절대경로로 조립
        String base = AI_SERVER_URL.replace("/generate-logo", "/");
        if (!base.endsWith("/") && !maybeRelative.startsWith("/")) {
            return base + "/" + maybeRelative;
        }
        return base + maybeRelative;
    }
}
