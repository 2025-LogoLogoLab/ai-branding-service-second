package com.example.logologolab.domain;

import jakarta.persistence.*;

import lombok.*;

import java.util.Set;
import java.util.HashSet;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(
        name = "brand_strategy",
        indexes = {
                @Index(name = "idx_brand_strategies_project", columnList = "project_id"),
                @Index(name = "idx_brand_strategies_creator", columnList = "created_by_id")
        }
)
public class BrandStrategy extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long rowVersion; // JPA 낙관적 잠금

    @Column(columnDefinition = "text", nullable = false)
    private String briefKo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Style style;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CaseType caseType;

    @Column(columnDefinition = "text")
    private String sourceImage; // S3 URL

    @Column(columnDefinition = "text", nullable = false)
    private String markdown;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "brand_strategy_tags",
            joinColumns = @JoinColumn(name = "brand_strategy_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    // 태그 관리 편의 메소드
    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }

    public void updateMarkdown(String markdown) {
        if (markdown != null && !markdown.isBlank()) {
            this.markdown = markdown;
        }
    }
}
