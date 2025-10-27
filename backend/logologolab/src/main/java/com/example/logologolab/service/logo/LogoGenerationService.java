package com.example.logologolab.service.logo;

import com.example.logologolab.domain.Logo;
import com.example.logologolab.domain.User;
import com.example.logologolab.repository.logo.LogoRepository;
import com.example.logologolab.service.flux.FluxGenerateService;
import com.example.logologolab.service.gpt.GptPromptService;
import com.example.logologolab.service.gpt.GptPromptService.PromptBundle;
import com.example.logologolab.service.s3.S3UploadService;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogoGenerationService {

    private final FluxGenerateService fluxGenerateService;
    private final GptPromptService gptPromptService;
    private final S3UploadService s3UploadService;
    private final LogoRepository logoRepository;

    public List<String> generateLogo(
            String userPromptKo,
            String style,
            String type,
            String negativePrompt,
            Integer steps,
            Double guidanceScale,
            Integer width,
            Integer height,
            Integer numImages
    ) {
        // 1) 한글 → 영어 (prompt + negativePrompt 동시 변환)
        PromptBundle bundle = gptPromptService.generatePrompts(userPromptKo, negativePrompt, style, type);
        String englishPrompt = bundle.prompt();
        String englishNegative = bundle.negativePrompt(); // "" 가능
        log.info("Using English Prompt: {}", englishPrompt);
        log.info("Using English Negative Prompt: {}", englishNegative);

        // 2) 기본값 보정
        int s = (steps != null ? steps : 50);
        double gs = (guidanceScale != null ? guidanceScale : 3.5);
        int w = (width != null ? width : 1024);
        int h = (height != null ? height : 1024);
        int n = (numImages != null ? numImages : 1);

        // 3) Flux 호출 (여러 장)
        return fluxGenerateService.generateLogoImageBase64(
                englishPrompt, style, englishNegative, s, gs, w, h, n
        );
    }

    /** 업로드만 해서 URL 반환 (DB 저장 안 할 때) */
    public String saveLogoToS3(String base64) {
        return s3UploadService.uploadBase64AndGetUrl(base64); // ★ 호출
    }

    /** 업로드 + DB 저장까지 할 때 */
    public String saveLogoToS3AndDb(User user, String prompt, String base64) {
        String url = s3UploadService.uploadBase64AndGetUrl(base64);
        Logo saved = logoRepository.save(
                Logo.builder()
                        .prompt(prompt)
                        .imageUrl(url)  // A안에서 s3Key 쓰고 싶으면 엔티티에 s3Key 추가하여 저장
                        .createdBy(user)
                        .build()
        );
        log.info("Saved logo id={}, url={}", saved.getId(), url);
        return url;
    }
}
