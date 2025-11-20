package com.example.logologolab.service.asset;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.asset.AssetListItem;
import com.example.logologolab.dto.asset.MyProductsResponse;
import com.example.logologolab.dto.brand.BrandStrategyListItem;
import com.example.logologolab.dto.color.ColorGuideDTO;
import com.example.logologolab.dto.color.ColorGuideListItem;
import com.example.logologolab.dto.logo.LogoListItem;
import com.example.logologolab.dto.project.ProjectListItem;
import com.example.logologolab.dto.tag.TagResponse;
import com.example.logologolab.repository.brand.BrandStrategyRepository;
import com.example.logologolab.repository.color.ColorGuideRepository;
import com.example.logologolab.repository.logo.LogoRepository;
import com.example.logologolab.repository.project.ProjectRepository;
import com.example.logologolab.security.LoginUserProvider;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyAssetService {

    private final LoginUserProvider loginUserProvider;
    private final ProjectRepository projectRepository;
    private final LogoRepository logoRepository;
    private final ColorGuideRepository colorGuideRepository;
    private final BrandStrategyRepository brandStrategyRepository;

    /** 내 모든 산출물을 종류별로 묶어서 조회 */
    public MyProductsResponse getMyProducts() {
        User user = loginUserProvider.getLoginUser();

        // 1. 종류별로 내 모든 산출물을 조회
        List<Logo> logos = logoRepository.findAllByCreatedBy(user);
        List<ColorGuide> colorGuides = colorGuideRepository.findAllByCreatedBy(user);
        List<BrandStrategy> brandStrategies = brandStrategyRepository.findAllByCreatedBy(user);

        // 2. 각 리스트를 ListItem DTO 리스트로 변환
        List<LogoListItem> logoListItems = logos.stream()
                .map(logo -> new LogoListItem(logo.getId(), logo.getPrompt(), logo.getImageUrl(), logo.getCreatedAt()))
                .toList();

        List<ColorGuideListItem> colorGuideListItems = colorGuides.stream()
                .map(cg -> new ColorGuideListItem(
                        cg.getId(),
                        cg.getBriefKo(),
                        cg.getStyle(),
                        new ColorGuideDTO(
                                new ColorGuideDTO.Role(cg.getMainHex(), cg.getMainDesc()),
                                new ColorGuideDTO.Role(cg.getSubHex(), cg.getSubDesc()),
                                new ColorGuideDTO.Role(cg.getPointHex(), cg.getPointDesc()),
                                new ColorGuideDTO.Role(cg.getBackgroundHex(), cg.getBackgroundDesc())
                        ),
                        cg.getCreatedAt()
                ))
                .toList();

        List<BrandStrategyListItem> brandStrategyListItems = brandStrategies.stream()
                .map(bs -> new BrandStrategyListItem(bs.getId(), bs.getBriefKo(), bs.getStyle(), bs.getMarkdown(), bs.getCreatedAt()))
                .toList();

        // 3. 최종 응답 DTO에 담아 반환
        return new MyProductsResponse(logoListItems, colorGuideListItems, brandStrategyListItems);
    }

    /** 내 프로젝트 목록 조회
    public List<ProjectListItem> listMyProjects() {
        User user = loginUserProvider.getLoginUser();
        return projectRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(ProjectListItem::from)
                .collect(Collectors.toList());
    }*/

    /** 내가 사용한 태그 목록 조회 */
    public List<TagResponse> listMyTags() {
        User user = loginUserProvider.getLoginUser();

        // 내 모든 산출물을 가져와서 태그들을 합친 뒤 중복 제거
        Stream<Tag> logoTags = logoRepository.findAllByCreatedBy(user).stream().flatMap(l -> l.getTags().stream());
        Stream<Tag> colorTags = colorGuideRepository.findAllByCreatedBy(user).stream().flatMap(c -> c.getTags().stream());
        Stream<Tag> brandTags = brandStrategyRepository.findAllByCreatedBy(user).stream().flatMap(b -> b.getTags().stream());

        return Stream.concat(Stream.concat(logoTags, colorTags), brandTags)
                .distinct()
                .map(TagResponse::from)
                .collect(Collectors.toList());
    }

    /** 특정 태그가 달린 내 산출물 목록 조회 */
    public List<AssetListItem> listMyAssetsByTag(String tagName) {
        User user = loginUserProvider.getLoginUser();

        // 각 종류별로 태그에 해당하는 산출물 조회
        List<AssetListItem> logos = logoRepository.findByTags_NameAndCreatedBy(tagName, user).stream().map(AssetListItem::from).toList();
        List<AssetListItem> colors = colorGuideRepository.findByTags_NameAndCreatedBy(tagName, user).stream().map(AssetListItem::from).toList();
        List<AssetListItem> brands = brandStrategyRepository.findByTags_NameAndCreatedBy(tagName, user).stream().map(AssetListItem::from).toList();

        // 3가지 목록을 합쳐서 최신순으로 정렬
        return Stream.concat(Stream.concat(logos.stream(), colors.stream()), brands.stream())
                .sorted(Comparator.comparing(AssetListItem::createdAt).reversed())
                .collect(Collectors.toList());
    }
}