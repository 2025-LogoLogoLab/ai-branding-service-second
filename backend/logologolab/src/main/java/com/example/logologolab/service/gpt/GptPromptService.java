package com.example.logologolab.service.gpt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.logologolab.dto.color.ColorGuideDTO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class GptPromptService {

    private static final Logger log = LoggerFactory.getLogger(GptPromptService.class);

    @Value("${openai.api.key}")
    private String openaiApiKey;
    private static final String OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

    // 이미지 입력 지원 모델(비전)
    private static final String VISION_MODEL = "gpt-4o-mini";

    private static final Set<String> ALLOWED_STYLES = Set.of(
            "simple","minimal","retro","vintage","cute","playful","luxury",
            "tattoo","futuristic","cartoon","watercolor"
    );

    // 타입에 따른 영어 키워드를 매핑
    private static final Map<String, String> TYPE_KEYWORDS = Map.of(
            "TEXT", "text-only design",
            "ICON", "icon only",
            "COMBO", "icon with text"
    );

    /* -------------------- 신규: prompt + negative_prompt 동시 변환 -------------------- */
    public PromptBundle generatePrompts(String userPromptKo, String negativePromptKo, String style, String type) {
        String normalizedStyle = normalizeStyle(style);

        // 타입에 맞는 영어 키워드 조회 (기본값은 "icon with text")
        String typeKeyword = TYPE_KEYWORDS.getOrDefault(type.toUpperCase(), "icon with text");

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemPrompt = """
역할:
너는 사용자의 한글 설명을 영어 Stable Diffusion/FLUX 프롬프트로 변환하는 도우미야.
다음 절차를 반드시 지켜.

1. 사용자가 입력한 한글 설명을 자연스러운 영어로 번역
2. 사용자가 입력한 스타일 키워드(예: cute, minimal, vintage 등)를 반드시 포함
3. 색상, 형태, 텍스트 포함 여부를 한글에서 추출해 영어로 반영
4. 생성형 모델이 잘 이해할 수 있도록 디테일 추가
5. 출력은 아래 포맷으로 제공

출력 포맷(JSON 한 줄):
{"prompt":"...", "negative_prompt":"...", "style":"one of: simple|minimal|retro|vintage|cute|playful|luxury|tattoo|futuristic|cartoon|watercolor"}

추가 규칙:
- 사용자는 한글 설명과 함께 "스타일"을 지정할 수 있다. 스타일 키워드는 LoRA 학습 시 사용한 것과 동일하게 Prompt에 반드시 포함한다.
- 간결하되 상세한 묘사 유지
- "로마자 표기"라는 내용이 있으면, 한국어 문구(상호명, 학교명 등)를 자연스러운 영어 표기(로마자 표기)로 변환한다. 예: "홍익대" → "Hongik University", "하연" → "Hayeon"
- "번역"이라는 내용이 있으면, 한국어 문구(상호명, 학교명 등)를 자연스러운 영어 단어로 번역하여 변환한다. 예: "사과" → "Apple", "살구" → "Apricot"
- Prompt 문장 안에 텍스트 문구가 들어갈 경우에는 " 대신 ' 로 감싸도록 변환한다. 예: 'Coco'
- 77 token을 넘지 않는다.
- 색상, 형태, 폰트, 텍스트 포함 여부 등을 영어로 자연스럽고 상세하게 추가하여, 최종적으로 한 문장으로 완성된 단일 prompt를 출력한다.
- 사용자가 선택한 로고 유형에 따라, 프롬프트에 다음 영어 키워드를 반드시 포함시켜라: [%s]

스타일별 프롬프트 규칙:
- simple, minimal: "white background, simple black icon, clean lines, minimal logo, modern sans_serif font"
- retro, vintage: "retro vintage logo, distressed texture, old-school serif font, classic badge design"
- cute, playful: "cute playful logo, colorful cartoon mascot, rounded sans-serif font, cheerful design"
- luxury : "luxury_premium_logo_lora"
- tattoo: "old-school tattoo style, bold black outlines, traditional Americana motifs, intricate linework, vintage tattoo aesthetic"
- futuristic: "futuristic logo, sleek metallic surfaces, neon glow accents, holographic effects, modern techno font, digital circuit-inspired design"
- cartoon : "a cartoon-style logo of a cute animal, vector, colorful, minimal design"
- watercolor : "watercolor, hand-drawn, soft tones, pastel colors, textured brush strokes, natural flow, light ink wash, artistic feel"

negative_prompt 규칙:
- 한글 negativePrompt가 제공되면 자연스러운 영어 제약 표현으로 변환한다. (예: "워터마크 제거" → "no watermark")
- 제공되지 않으면 빈 문자열 ""을 넣는다.

반드시 아래 **JSON 한 줄**만 응답해:
{"prompt":"...", "negative_prompt":"...", "style":"..."}
""".formatted(typeKeyword);

        String userContent = String.format("""
설명(한국어): %s
스타일(고정값): %s
네거티브 프롬프트(한국어, 없으면 빈 값 허용): %s
로고 유형은 프런트에서 결정된 값을 따르며, 설명에 포함된 텍스트/색/형태를 반영해 단일 영어 문장 프롬프트를 만들어줘.
""", userPromptKo, normalizedStyle, (negativePromptKo == null ? "" : negativePromptKo), typeKeyword);

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4.1-nano",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userContent)
                ),
                "temperature", 0.2
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_ENDPOINT, request, Map.class);

            List<Map<String, Object>> choices =
                    (List<Map<String, Object>>) response.getBody().get("choices");
            Map<String, Object> message =
                    (Map<String, Object>) choices.get(0).get("message");
            String content = ((String) message.get("content")).trim();

            ObjectMapper om = new ObjectMapper();
            // 우선 JSON 전체 파싱 시도
            PromptBundle bundle = extractBundleFromContent(content, om);

            log.info("Generated English Prompt: {}", bundle.prompt());
            log.info("Generated English Negative Prompt: {}", bundle.negativePrompt());
            return bundle;

        } catch (HttpClientErrorException e) {
            log.error("OpenAI 4xx Error: {}", e.getResponseBodyAsString(), e);
            throw e;
        } catch (Exception e) {
            log.error("OpenAI 호출/파싱 중 오류", e);
            throw new IllegalStateException("Failed to generate prompts", e);
        }
    }

    /* -------------------- 기존 호환: prompt만 필요할 때 -------------------- */
    public String generatePrompt(String userPromptKo, String style) {
        PromptBundle b = generatePrompts(userPromptKo, null, style, "COMBO");
        return b.prompt();
    }

    /* -------------------- 공통 유틸 -------------------- */

    private String normalizeStyle(String style) {
        String normalized = (style == null) ? "minimal" : style.trim().toLowerCase();
        if (!ALLOWED_STYLES.contains(normalized)) {
            normalized = "minimal";
        }
        return normalized;
    }

    /** content에서 prompt/negative_prompt/style을 파싱. 실패 시 {...} 블록 재시도, 최후엔 prompt만 content로 세팅 */
    private PromptBundle extractBundleFromContent(String content, ObjectMapper om) {
        // 1차: content를 JSON으로 가정
        PromptBundle b = tryParseBundle(content, om);
        if (b != null) return b;

        // 2차: {...} 블록 추출 후 재시도
        try {
            int s = content.indexOf('{');
            int t = content.lastIndexOf('}');
            if (s >= 0 && t > s) {
                String json = content.substring(s, t + 1);
                b = tryParseBundle(json, om);
                if (b != null) return b;
            }
        } catch (Exception ignore) { }

        // 3차: 최후수단 — prompt만 content로 반환, negative_prompt는 빈 문자열
        log.debug("Raw GPT content (non-JSON or parse failed): {}", content);
        return new PromptBundle(content.trim(), "", "");
    }

    private PromptBundle tryParseBundle(String json, ObjectMapper om) {
        try {
            JsonNode root = om.readTree(json);
            String prompt = safeTxt(root, "prompt");
            String neg = safeTxt(root, "negative_prompt");
            String style = safeTxt(root, "style");
            if (prompt != null && !prompt.isBlank()) {
                return new PromptBundle(prompt.trim(), (neg == null ? "" : neg.trim()), (style == null ? "" : style.trim()));
            }
        } catch (Exception ignore) {}
        return null;
    }

    private String safeTxt(JsonNode root, String field) {
        JsonNode n = root.path(field);
        return n.isMissingNode() ? null : n.asText(null);
    }

    /* 간단 레코드: 서비스 간 전달용 */
    public record PromptBundle(String prompt, String negativePrompt, String style) {}

    private String normalizeHexOut(String hex) {
        if (hex == null) return null;
        String s = hex.trim().toUpperCase();
        if (!s.startsWith("#")) s = "#" + s;
        if (!s.matches("^#[0-9A-F]{6}$")) return null; // 불량이면 null -> FE가 경고 처리 가능
        return s;
    }

    /* ===================== 컬러가이드 ===================== */
    // (A) 텍스트만: 새 HEX 제안
    public ColorGuideDTO generateColorGuideTextOnly(String briefKo, String style) {
        return generateColorGuideCore("without_logo", briefKo, style);
    }

    // (B) 텍스트 + 이미지: 로고 이미지로부터 팔레트 추정 & 설명
    public ColorGuideDTO generateColorGuideFromImage(String briefKo, String style, String imageDataUrl) {
        String normalizedStyle = normalizeStyle(style);
        RestTemplate rest = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemPrompt = """
너는 전문 브랜드 디자이너다. 아래 첨부된 로고 이미지를 분석해 브랜드 컬러가이드를 만든다.
반드시 아래 JSON 형식으로만 답하고, 다른 문장은 절대 포함하지 마라.

[OUTPUT JSON SCHEMA]
{
  "main": { "hex": "#RRGGBB", "description": "string" },
  "sub": { "hex": "#RRGGBB", "description": "string" },
  "point": { "hex": "#RRGGBB", "description": "string" },
  "background": { "hex": "#RRGGBB", "description": "string" }
}

[RULES]
- 모든 HEX는 대문자 RRGGBB 형식.
- main=대표색, sub=보조색, point=강조색, background=배경색.
- 이미지에서 실제로 관측되는 색을 우선 사용하고, 비슷한 근사치는 허용.
- description에는 색의 감성(느낌) + 추천 용도(버튼/텍스트/섹션 배경 등)를 간결히 적을 것.
- 스타일 힌트: %s
""".formatted(normalizedStyle);

        Map<String, Object> userText = Map.of("type", "text", "text", "브리프: " + briefKo);
        Map<String, Object> image = Map.of("type", "image_url", "image_url", Map.of("url", imageDataUrl));

        Map<String, Object> req = Map.of(
                "model", VISION_MODEL,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", List.of(userText, image))
                ),
                "temperature", 0.2,
                "response_format", Map.of("type", "json_object")
        );

        HttpEntity<Map<String, Object>> httpReq = new HttpEntity<>(req, headers);

        try {
            ResponseEntity<Map> httpResp = rest.postForEntity(OPENAI_ENDPOINT, httpReq, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) httpResp.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String content = ((String) message.get("content")).trim();

            ObjectMapper om = new ObjectMapper();
            ColorGuideDTO out = om.readValue(content, ColorGuideDTO.class);
            return new ColorGuideDTO(
                    new ColorGuideDTO.Role(normalizeHexOut(out.main().hex()), out.main().description()),
                    new ColorGuideDTO.Role(normalizeHexOut(out.sub().hex()), out.sub().description()),
                    new ColorGuideDTO.Role(normalizeHexOut(out.point().hex()), out.point().description()),
                    new ColorGuideDTO.Role(normalizeHexOut(out.background().hex()), out.background().description())
            );

        } catch (HttpClientErrorException e) {
            log.error("OpenAI 4xx Error: {}", e.getResponseBodyAsString(), e);
            throw e;
        } catch (Exception e) {
            log.error("컬러가이드(이미지) 생성 실패", e);
            throw new IllegalStateException("Failed to generate color guide from image", e);
        }
    }

    // 내부 공통(텍스트만)
    private ColorGuideDTO generateColorGuideCore(String caseType, String briefKo, String style) {
        String normalizedStyle = normalizeStyle(style);
        RestTemplate rest = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemPrompt = """
너는 전문 브랜드 디자이너다. 사용자의 입력을 바탕으로 브랜드 컬러가이드를 만든다.
반드시 아래 JSON 형식으로만 답하고, 다른 문장은 절대 포함하지 마라.

[OUTPUT JSON SCHEMA]
{
  "main": { "hex": "#RRGGBB", "description": "string" },
  "sub": { "hex": "#RRGGBB", "description": "string" },
  "point": { "hex": "#RRGGBB", "description": "string" },
  "background": { "hex": "#RRGGBB", "description": "string" }
}

[RULES]
- 모든 HEX는 대문자 RRGGBB 형식.
- main=대표색, sub=보조색, point=강조색, background=배경색.
- description에는 색의 감성(느낌) + 추천 용도(버튼/텍스트/섹션 배경 등)를 간결히 적을 것.
- case가 "without_logo"이므로 업종/회사명/스타일을 바탕으로 HEX를 새로 제안한다.
- 스타일 힌트: %s
""".formatted(normalizedStyle);

        Map<String, Object> userPayload = Map.of(
                "case", caseType,        // without_logo
                "briefKo", briefKo,
                "style", normalizedStyle
        );

        Map<String, Object> req = Map.of(
                "model", "gpt-4.1-nano",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", new ObjectMapper().valueToTree(userPayload).toString())
                ),
                "temperature", 0.2,
                "response_format", Map.of("type", "json_object")
        );

        HttpEntity<Map<String, Object>> httpReq = new HttpEntity<>(req, headers);

        try {
            ResponseEntity<Map> httpResp = rest.postForEntity(OPENAI_ENDPOINT, httpReq, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) httpResp.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String content = ((String) message.get("content")).trim();

            ObjectMapper om = new ObjectMapper();
            ColorGuideDTO out = om.readValue(content, ColorGuideDTO.class);
            return new ColorGuideDTO(
                    new ColorGuideDTO.Role(normalizeHexOut(out.main().hex()), out.main().description()),
                    new ColorGuideDTO.Role(normalizeHexOut(out.sub().hex()), out.sub().description()),
                    new ColorGuideDTO.Role(normalizeHexOut(out.point().hex()), out.point().description()),
                    new ColorGuideDTO.Role(normalizeHexOut(out.background().hex()), out.background().description())
            );

        } catch (HttpClientErrorException e) {
            log.error("OpenAI 4xx Error: {}", e.getResponseBodyAsString(), e);
            throw e;
        } catch (Exception e) {
            log.error("컬러가이드 생성 실패", e);
            throw new IllegalStateException("Failed to generate color guide", e);
        }
    }

    /* ===================== 브랜딩 전략 ===================== */
    // (A) 텍스트만: without_logo 규칙(로고 방향 미니 섹션 포함)
    public String generateBrandingStrategyTextOnly(String briefKo, String style) {
        return generateBrandingStrategyCore(briefKo, style);
    }

    // (B) 텍스트 + 이미지: with_logo 규칙(이미지 관찰 기반, HEX 제시는 피하고 활용 전략)
    public String generateBrandingStrategyFromImage(String briefKo, String style, String imageDataUrl) {
        String normalizedStyle = normalizeStyle(style);
        RestTemplate rest = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemPrompt = """
역할:
너는 사용자의 한글 입력과 첨부된 로고 이미지를 바탕으로 '브랜딩 전략 가이드'를 작성하는 전문가다.
출력은 **한국어** 문자열(마크다운)로 하고, 아래 섹션 구조와 규칙을 반드시 지켜라.

[섹션 구조 - 반드시 이 헤딩/순서 유지]
###브랜드 컨셉
키워드: ...
브랜드 이미지 설명: ...

###브랜드 포지셔닝
목표 고객: ...
차별화 포인트: ...
경쟁 우위 요소: ...

###마케팅 전략
SNS 중심 홍보: ...
참여형 이벤트: ...
브랜드 스토리텔링: ...
굿즈 마케팅: ...

###사업 꿀팁
마스코트 IP 확장: ...
콜라보레이션: ...
디지털 브랜딩 강화: ...
데이터 기반 개선: ...

[케이스]
- with_logo(이미지 제공) 상황이다. 이미지에서 관찰되는 팔레트/모티프/타이포 특성을 바탕으로 **활용 방식**을 제시하되, 구체 HEX 수치 제시는 피한다.
- 스타일 힌트: %s
[출력 형식 준수]
- 반드시 위 섹션 헤딩/라벨 사용. 불필요한 서론/말머리 금지. 섹션 구조에서 ### 뒤에 띄어쓰기 금지 ('### 사업 꿀팁' 이런식으로 하지 말고 '###사업 꿀팁' 이런식으로).
""".formatted(normalizedStyle);

        Map<String, Object> userText = Map.of("type", "text", "text", "브리프: " + briefKo);
        Map<String, Object> image = Map.of("type", "image_url", "image_url", Map.of("url", imageDataUrl));

        Map<String, Object> req = Map.of(
                "model", VISION_MODEL,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", List.of(userText, image))
                ),
                "temperature", 0.3
        );

        HttpEntity<Map<String, Object>> httpReq = new HttpEntity<>(req, headers);

        try {
            ResponseEntity<Map> httpResp = rest.postForEntity(OPENAI_ENDPOINT, httpReq, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) httpResp.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return ((String) message.get("content")).trim();

        } catch (HttpClientErrorException e) {
            log.error("OpenAI 4xx Error: {}", e.getResponseBodyAsString(), e);
            throw e;
        } catch (Exception e) {
            log.error("브랜딩 전략(이미지) 생성 실패", e);
            throw new IllegalStateException("Failed to generate branding strategy from image", e);
        }
    }

    // 내부 공통(텍스트만)
    private String generateBrandingStrategyCore(String briefKo, String style) {
        String normalizedStyle = normalizeStyle(style);
        RestTemplate rest = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemPrompt = """
역할:
너는 사용자의 한글 입력을 바탕으로 '브랜딩 전략 가이드'를 작성하는 전문가다.
출력은 **한국어**로 하고, 아래 섹션 구조와 규칙을 반드시 지켜라.

[섹션 구조 - 반드시 이 헤딩/순서 유지]
###브랜드 컨셉
키워드: ...
브랜드 이미지 설명: ...

###브랜드 포지셔닝
목표 고객: ...
차별화 포인트: ...
경쟁 우위 요소: ...

###마케팅 전략
SNS 중심 홍보: ...
참여형 이벤트: ...
브랜드 스토리텔링: ...
굿즈 마케팅: ...

###사업 꿀팁
마스코트 IP 확장: ...
콜라보레이션: ...
디지털 브랜딩 강화: ...
데이터 기반 개선: ...

[케이스]
- without_logo(이미지 없음) 상황이다. '브랜드 컨셉' 섹션 끝에 2~3줄의 '로고 방향(미니)'을 포함한다.
- 스타일 힌트: %s
[출력 형식 준수]
- 반드시 위 섹션 헤딩/라벨 사용. 불필요한 서론/말머리 금지. 섹션 구조에서 ### 뒤에 띄어쓰기 금지 ('### 사업 꿀팁' 이런식으로 하지 말고 '###사업 꿀팁' 이런식으로).
""".formatted(normalizedStyle);

        String userPrompt = "입력(한국어): " + briefKo;

        Map<String, Object> req = Map.of(
                "model", "gpt-4.1-nano",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.3
        );

        HttpEntity<Map<String, Object>> httpReq = new HttpEntity<>(req, headers);

        try {
            ResponseEntity<Map> httpResp = rest.postForEntity(OPENAI_ENDPOINT, httpReq, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) httpResp.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return ((String) message.get("content")).trim();

        } catch (HttpClientErrorException e) {
            log.error("OpenAI 4xx Error: {}", e.getResponseBodyAsString(), e);
            throw e;
        } catch (Exception e) {
            log.error("브랜딩 전략 생성 실패", e);
            throw new IllegalStateException("Failed to generate branding strategy", e);
        }
    }
}