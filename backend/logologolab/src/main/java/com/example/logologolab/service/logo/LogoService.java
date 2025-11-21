package com.example.logologolab.service.logo;

import com.example.logologolab.domain.Logo;
import com.example.logologolab.domain.User;
import com.example.logologolab.dto.color.ColorGuideListItem;
import com.example.logologolab.security.LoginUserProvider;
import com.example.logologolab.dto.common.PageResponse;
import com.example.logologolab.dto.logo.LogoListItem;
import com.example.logologolab.dto.logo.LogoResponse;
import com.example.logologolab.repository.logo.LogoRepository;
import com.example.logologolab.service.s3.S3UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LogoService {

    private final LogoRepository logoRepository;
    private final LoginUserProvider loginUserProvider;
    private final S3UploadService s3UploadService;

    public LogoResponse getLogo(Long id) {
        Logo logo = logoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("로고를 찾을 수 없습니다."));
        return LogoResponse.from(logo);
    }

    public Page<LogoListItem> listMyLogos(Pageable pageable) {
        User user = loginUserProvider.getLoginUser();
        return logoRepository.findByCreatedBy(user, pageable)
                .map(logo -> new LogoListItem(logo.getId(), logo.getPrompt(), logo.getImageUrl(), logo.getCreatedAt()));
    }

    public Page<LogoListItem> listPublicLogos(Pageable pageable) {
        return logoRepository.findAll(pageable)
                .map(logo -> new LogoListItem(logo.getId(), logo.getPrompt(), logo.getImageUrl(), logo.getCreatedAt()));
    }

    @Transactional
    public void deleteLogo(Long id) {
        User user = loginUserProvider.getLoginUser();
        Logo logo = logoRepository.findByIdAndCreatedBy(id, user)
                .orElseThrow(() -> new NoSuchElementException("삭제할 로고를 찾을 수 없거나 권한이 없습니다."));

        // 1. S3에서 이미지 파일 삭제
        s3UploadService.deleteObjectByUrl(logo.getImageUrl());

        // 2. DB에서 로고 데이터 삭제
        logoRepository.delete(logo);
    }
}